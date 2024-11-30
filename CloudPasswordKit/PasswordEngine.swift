//
//  CloudPasswordKit.swift
//  CloudPasswordKit
//
//  Created by Sash Zats on 11/28/24.
//

import Foundation
import JavaScriptCore
import os.log

@Observable
public final class PasswordEngine {
  private let helperPath = "/System/Volumes/Preboot/Cryptexes/App/System/Library/CoreServices/PasswordManagerBrowserExtensionHelper.app/Contents/MacOS/PasswordManagerBrowserExtensionHelper"
  private let bundle = Bundle(for: PasswordEngine.self)
  private var jsContext: JSContext = JSContext()
  private let logger = Logger(subsystem: "com.cloudpasswordkit", category: "javascript")
  private var helperProcess: Process?
  private var helperStdin: FileHandle?
  private var stdoutQueue = DispatchQueue(label: "com.cloudpasswordkit.stdout")
  private let process = Process()
  
  public enum State {
    case idle, pinRequisted, authenticated
  }
  private(set) public var state = State.idle
  
  public init() {}
  
  public func start() {
    launchProcessInteractive()
    setupJSContext()
  }
  
  public func showPin() {
    jsContext.evaluateScript("ChallengePIN()")
  }
  
  public func setPin(_ pin: String) {
    jsContext.evaluateScript("PINSet(\"\(pin)\")")
  }
  
  public struct LoginSearchResult {
    public let username: String
    public let domain: String
  }
  
  private var getUsernamesCompletion: (([LoginSearchResult]) -> Void)?
  public func getLoginNames(url: URL, completion: @escaping ([LoginSearchResult]) -> Void) {
    getUsernamesCompletion = nil
    guard let host = url.host() else {
      assertionFailure("no host")
      return
    }
    jsContext.evaluateScript("GetLoginNames4URL(\"\(host)\", 1, 0)")
    getUsernamesCompletion = completion
  }
  
  
  public struct PasswordRecord: Identifiable, Hashable {
    public let id = UUID()
    public let username: String
    public let password: String
    public let domain: String
  }
  private var getPasswordCompletion: ((PasswordRecord) -> Void)?
  public func getPassword(username: String, url: URL, completion: @escaping (PasswordRecord) -> Void) {
    getPasswordCompletion = nil
    guard let host = url.host() else {
      assertionFailure("no host")
      return
    }
    jsContext.evaluateScript("GetPassword4Name(\"\(host)\", \"\(username)\", 1, 0)")
    getPasswordCompletion = completion
  }
  
  // MARK: - Private
  
  func launchProcessInteractive() {
    // Create and configure the process
    
    process.executableURL = URL(fileURLWithPath: helperPath)
    process.arguments = [ "password-manager-firefox-extension@apple.com" ]
    
    // Create pipes for stdin and stdout
    let inputPipe = Pipe()
    let outputPipe = Pipe()
    process.standardInput = inputPipe
    process.standardOutput = outputPipe
    helperStdin = inputPipe.fileHandleForWriting

    // Handle stdout interactively
    let outputHandle = outputPipe.fileHandleForReading
    outputHandle.readabilityHandler = { [weak self] fileHandle in
      self?.handleReply(with: fileHandle.availableData)
    }
    
    do {
      // Start the process
      try process.run()
      
      // Wait for the process to finish in a background thread
      DispatchQueue.global().async { [weak self] in
        guard let self else { return }
        process.waitUntilExit()
        print("Process terminated with status: \(process.terminationStatus)")
        // Cleanup
        outputHandle.readabilityHandler = nil
        self.helperStdin = nil // Close input when the process ends
      }
    } catch {
      print("Error running process: \(error)")
    }
  }
  
  private func handleReply(with data: Data) {
    // Need at least 4 bytes for the length
    guard data.count >= 4 else { return }
    
    // Read the length (first 4 bytes, big endian)
    let length = data.prefix(4).withUnsafeBytes { $0.load(as: UInt32.self).littleEndian }
    
    // Check if we have enough data for the complete message
    let messageStart = 4
    let messageEnd = messageStart + Int(length)
    guard data.count >= messageEnd else {
        logger.error("Incomplete message: expected \(length) bytes, got \(data.count - 4)")
        return
    }
    
    // Extract the JSON data
    let messageData = data.subdata(in: messageStart..<messageEnd)
    
    do {
        // Parse JSON
        guard let message = try JSONSerialization.jsonObject(with: messageData) as? [String: Any] else {
            logger.error("Invalid JSON message format")
            return
        }
        
        logger.debug("Received message: \(message)")
        
        // Dispatch message to JavaScript
        DispatchQueue.main.async { [weak self] in
            self?.dispatchMessageToJavaScript(message)
        }
        
    } catch {
        logger.error("Failed to parse JSON message: \(error.localizedDescription)")
        if let messageString = String(data: messageData, encoding: .utf8) {
            logger.error("Raw message: \(messageString)")
        }
    }
  }
  
  // Separate function to write to the process's stdin
  func writeToProcess(_ json: [String: Any]) {
    guard let helperStdin else {
        print("Input handle is not available. The process may have terminated.")
        return
    }
    
    guard let jsonData = try? JSONSerialization.data(withJSONObject: json) else {
        logger.error("Failed to serialize JSON")
        return
    }
    
    // Create a single buffer containing both length and data
    var length = UInt32(jsonData.count).littleEndian
    var buffer = Data(bytes: &length, count: 4)
    buffer.append(jsonData)
    
    // Write everything in one go
    helperStdin.write(buffer)
  }
  
  private func dispatchMessageToJavaScript(_ message: [String: Any]) {
    
    // Convert message to JSValue
    guard let messageValue = JSValue(object: message, in: jsContext) else {
      logger.error("Failed to convert message to JSValue")
      return
    }
    
    if let handler = jsContext.objectForKeyedSubscript("onMessageReceived") {
      handler.call(withArguments: [messageValue])
    }
  }
  
  private func setupJSContext() {
    jsContext = JSContext()
    
    // Set up exception handler
    jsContext.exceptionHandler = { [weak self] context, exception in
      guard let exception = exception else {
        self?.logger.error("Unknown JavaScript error occurred")
        return
      }
      
      let line = exception.objectForKeyedSubscript("line")?.toString() ?? "unknown"
      let stackTrace = exception.objectForKeyedSubscript("stack")?.toString() ?? "no stack trace"
      let name = exception.objectForKeyedSubscript("name")?.toString() ?? "unknown"
      let message = exception.toString()
      
      self?.logger.error("\(name): \(message ?? "No message") @ line \(line)\n\(stackTrace)")
    }
    
    setupConsole()
    setupCommunication()
    loadJSSources()
  }
  
  private func setupConsole() {
    let console = JSValue(newObjectIn: jsContext)
    
    // Define console methods
    let consoleMethods: [(name: String, level: OSLogType)] = [
      ("log", .debug),
      ("info", .info),
      ("warn", .error),
      ("error", .error)
    ]
    
    
    // Set up each console method
    for (methodName, logLevel) in consoleMethods {
      let jsValueToString: (JSValue) -> Any = { value in
        if value.isUndefined {
          return "undefined"
        } else if let value = value.toString() {
          return value
        } else if let value = value.toNumber() {
          return value
        } else if value.isBoolean {
          return value.toBool()
        } else if let value = value.toDate() {
          return value
        } else if let value = value.toArray() {
          return value
        } else if let value = value.toObject() {
          return value
        } else if let value = value.toDictionary() {
          return value
        }
        return value
      }
      let fn: @convention(block) (JSValue, JSValue, JSValue, JSValue, JSValue, JSValue) -> Void = { [weak self] m1, m2, m3, m4, m5, m6 in
        //        let message = messages.map { "\($0)" }.joined(separator: " ")
        let message = [m1, m2, m3, m4, m5, m6].filter { !$0.isUndefined }.compactMap { "\(jsValueToString($0))" }.joined(separator: " ")
        self?.logger.log(level: logLevel, "\(message)")
      }
      console?.setObject(fn, forKeyedSubscript: methodName as NSString)
    }
    
    // Assign the console object to the global scope
    jsContext.setObject(console, forKeyedSubscript: "console" as NSString)
  }
  
  private func setupCommunication() {
    let fn: @convention(block) (JSValue) -> Void = { [weak self] input in
      guard let self,
            let args = input.toDictionary() as? [String: Any],
            let name = args["name"] as? String,
            let arguments = args["arguments"] as? [Any] else { return }
      
      switch name {
      case "postMessage":
        if let message = arguments.first as? [String: Any] {
          writeToProcess(message)
        }
      case "sendMessageToPopup":
        process(arguments: arguments) { subject, data in
          switch subject {
          case "nativeConnectionStateChanged":
            guard let state = data["state"] as? String else {
              assertionFailure("State not found in \(data)")
              return
            }
            switch state {
            case "NotInSession":
              self.state = .idle
            case "ChallengeSent", "MSG1Set":
              self.state = .pinRequisted
            case "SessionKeySet":
              self.state = .authenticated
            default:
              // no-op
              assertionFailure("Unexpected state: \(state)")
            }
          case "users":
            // search results
            guard let domains = data["arrHLDs"] as? [String], let logins = data["arrLoginNames"] as? [String], domains.count == logins.count else {
              return
            }
            self.getUsernamesCompletion?(zip(logins, domains).map { LoginSearchResult(username: $0, domain: $1) })
            self.getUsernamesCompletion = nil

          case "hello":
            // no-op
            break
          default:
            assertionFailure("Unexpected subject \(subject)")
          }
        }
      case "sendMessage":
        process(arguments: arguments) { subject, data in
          switch subject {
          case "fillPassword":
            guard let username = data["username"] as? String,
                  let password = data["password"] as? String,
                  let domain = data["url"] as? String else {
              assertionFailure("Invalid fill password subject: \(data)")
              return
            }
            self.getPasswordCompletion?(PasswordRecord(username: username, password: password, domain: domain))
            self.getPasswordCompletion = nil
          default:
            assertionFailure("Unexpected subject: \(subject)")
          }
        }
      case "sendMessageToCompletionList":
        print("sendMessageToPopup", arguments)
      default:
        assertionFailure("Unknown bridge function \(name)")
      }
    }
    jsContext.setObject(fn, forKeyedSubscript: "bridgeFunctionCall" as NSString)
  }
  
  private func process(arguments: [Any], success: (_ subject: String, _ data: [String: Any]) -> Void) {
    guard let data = arguments.compactMap({ $0 as? [String: Any] }).first, let subject = data["subject"] as? String else {
      assertionFailure("Failed to parse subject in \(arguments)")
      return
    }
    success(subject, data)
  }
  
  private func loadJSSources() {
    guard let jsUrls = bundle.urls(forResourcesWithExtension: "js", subdirectory: nil) else {
      assertionFailure("No js sources found in bundle")
      return
    }
    
    // Load js files
    let allowed: [String] = [ "stubs", "background" ]
    jsUrls.filter { allowed.contains($0.deletingPathExtension().lastPathComponent) }.sorted(by: { file1, file2 in
      guard let idx1 = allowed.firstIndex(of: file1.deletingPathExtension().lastPathComponent),
            let idx2 = allowed.firstIndex(of: file2.deletingPathExtension().lastPathComponent) else {
        return false
      }
      return idx1 < idx2
    }).forEach { url in
      guard let script = try? String(contentsOf: url, encoding: .utf8) else {
        assertionFailure("Failed to load \(url)")
        return
      }
      jsContext.evaluateScript(script, withSourceURL: url)
    }
  }
  
  deinit {
    helperStdin?.closeFile()
    helperProcess?.terminate()
  }
}

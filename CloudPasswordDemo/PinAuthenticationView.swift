//
//  PinAuthenticationView.swift
//  CloudPasswordDemo
//
//  Created by Sash Zats on 11/29/24.
//

import SwiftUI
import CloudPasswordKit

struct PinAuthenticationView: View {
  let passwordEngine: PasswordEngine

  @State private var pin = ""
  @FocusState private var isPinFocused
  
  var body: some View {
    VStack {
      TextField("Pin", text: $pin)
        .font(.largeTitle.monospaced())
        .multilineTextAlignment(.center)
        .disabled(passwordEngine.state != .pinRequisted)
        .focused($isPinFocused)
        .frame(maxWidth: 250)
        .overlay(alignment: .trailing) {
          Button(action: {
            switch passwordEngine.state {
            case .idle:
              passwordEngine.showPin()
              isPinFocused = true
            case .pinRequisted:
              submitPin()
            default:
              assertionFailure("Invalid state \(passwordEngine.state)")
            }
          }, label: {
            Image(systemName: passwordEngine.state == .idle ? "key.fill" : "return")
              .aspectRatio(1, contentMode: .fit)
          })
          .buttonStyle(.borderedProminent)
          .padding(.trailing, 8)
        }
        .onSubmit {
          submitPin()
        }
    }
    .onChange(of: passwordEngine.state) { oldValue, newValue in
      if oldValue != newValue, newValue == .idle {
        // reset pin
        pin = ""
      }
    }
  }
  
  private func submitPin() {
    passwordEngine.setPin(pin)
  }
}

#Preview {
  PinAuthenticationView(passwordEngine: PasswordEngine())
}


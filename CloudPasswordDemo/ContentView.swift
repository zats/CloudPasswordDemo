//
//  ContentView.swift
//  CloudPasswordDemo
//
//  Created by Sash Zats on 11/28/24.
//

import SwiftUI
import CloudPasswordKit

struct ContentView: View {
  @State private var passwordEngine: PasswordEngine
  @State private var currentPassword: PasswordEngine.PasswordRecord?
  
  init() {
    let engine = PasswordEngine()
    engine.start()
    _passwordEngine = State(initialValue: engine)
  }
    
  var body: some View {
    VStack {
      switch passwordEngine.state {
      case .idle, .pinRequisted:
        PinAuthenticationView(passwordEngine: passwordEngine)
      case .authenticated:
        UsernamesQueryView(engine: $passwordEngine) { record in
          passwordEngine.getPassword(username: record.username, url: record.url) { record in
            currentPassword = record
          }
        }
      @unknown default:
        EmptyView()
      }
    }
    .alert(currentPassword?.username ?? "Password", isPresented: Binding<Bool>(get: { currentPassword != nil }, set: { if $0 == false { currentPassword = nil } }), presenting: currentPassword, actions: { record in
      Button("OK") {}
    }, message: { record in
      Text(record.password)
    })
  }
}

#Preview {
  ContentView()
    .frame(minWidth: 300, minHeight: 300)
}

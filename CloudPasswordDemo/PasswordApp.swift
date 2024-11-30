//
//  PasswordApp.swift
//  CloudPasswordDemo
//
//  Created by Sash Zats on 11/28/24.
//

import SwiftUI
import CloudPasswordKit

@main
struct PasswordApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
        .frame(minWidth: 300, minHeight: 300)
    }
    .windowResizability(.contentMinSize)
  }
}

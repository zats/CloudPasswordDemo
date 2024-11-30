//
//  UsernamesQueryView.swift
//  CloudPasswordDemo
//
//  Created by Sash Zats on 11/29/24.
//
import SwiftUI
import CloudPasswordKit

struct UsernameSearchResult: Identifiable, Hashable {
  let id = UUID()
  let username: String
  let domain: String
  
  var url: URL {
    if domain.hasPrefix("http") {
      URL(string: domain)!
    } else {
      URL(string: "https://" + domain)!
    }
  }
}

struct UsernamesQueryView: View {
  @State private var search = ""
  @State private var results: [UsernameSearchResult] = []
  @Binding var engine: PasswordEngine
  var onSelectionChange: (UsernameSearchResult) -> Void
  
  var body: some View {
    VStack(spacing: 0) {
      TextField("Search", text: $search)
        .font(.largeTitle)
      List {
        ForEach(results) { result in
          HStack {
            Image(systemName: "key.fill")
              .font(.largeTitle)
              .foregroundStyle(.secondary)
            VStack(alignment: .leading) {
              Text(result.username)
                .foregroundStyle(.primary)
              Text(result.domain)
                .foregroundStyle(.secondary)
            }
          }
          .background(.background)
          .onTapGesture {
            onSelectionChange(result)
          }
        }
      }
      .listStyle(.bordered)
      .opacity(results.isEmpty ? 0 : 1)
    }
    .onChange(of: search) { oldValue, newValue in
      if !newValue.isEmpty, oldValue != newValue, let url = url(from: newValue) {
        // kick off search
        engine.getLoginNames(url: url) { results in
          self.results = results.map {
            UsernameSearchResult(username: $0.username, domain: $0.domain)
          }
        }
      }
    }
  }
  
  private func url(from search: String) -> URL? {
    guard let url = if search.hasPrefix("https://") || search.hasPrefix("http://") {
      URL(string: search)
    } else {
      URL(string: "https://\(search)")
    }
    else {
      return nil
    }
    
    return if url.host() != nil {
      url
    } else {
      nil
    }
  }
}

#Preview {
  UsernamesQueryView(engine: .constant(PasswordEngine()), onSelectionChange: { _ in })
}

//
//  ViewController.swift
//  Universal Video Screenshot Studio
//
//  Created by koraybirand on 9.09.2026.
//

import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "com.local.universalscreenshot.Extension"

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self
        self.webView.configuration.userContentController.add(self, name: "controller")

        if let mainURL = Bundle.main.url(forResource: "Main", withExtension: "html"),
           let resourceURL = Bundle.main.resourceURL {
            self.webView.loadFileURL(mainURL, allowingReadAccessTo: resourceURL)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        NSLog("[UVSS] webView didFinish navigation, checking extension state for \(extensionBundleIdentifier)...")
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            if let error = error {
                NSLog("[UVSS] getStateOfSafariExtension error: %@", error.localizedDescription)
            }
            if let state = state {
                NSLog("[UVSS] getStateOfSafariExtension state.isEnabled: %d", state.isEnabled)
            }
            guard let state = state, error == nil else {
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show(\(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show(\(state.isEnabled), false)")
                }
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? String, body == "open-preferences" else {
            return
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { _ in
            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
    }

}

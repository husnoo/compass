package com.husnoo.compass;

import android.app.Activity;
import android.os.Bundle;

import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;


public class CompassActivity extends Activity
{
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

	WebView myWebView = (WebView) findViewById(R.id.webview);
	myWebView.setWebChromeClient(new WebChromeClient());

	WebSettings webSettings = myWebView.getSettings();
	webSettings.setJavaScriptEnabled(true);


	myWebView.loadUrl("file:///android_asset/index.html");

	
    }
}

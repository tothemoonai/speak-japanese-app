package com.speakjapanese.app;

import android.os.Bundle;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;
import com.speakjapanese.app.localasr.LocalASRPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocalASRPlugin.class);
        super.onCreate(savedInstanceState);

        // 设置透明状态栏
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
    }

    @Override
    public void onBackPressed() {
        // 不退出应用，而是将应用移到后台（类似按Home键）
        // 这样用户状态会被保留，下次打开还在登录状态
        moveTaskToBack(true);
    }
}

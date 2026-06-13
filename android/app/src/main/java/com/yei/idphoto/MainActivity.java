package com.yei.idphoto;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 앱 내장 커스텀 플러그인 등록 (super.onCreate 이전)
        registerPlugin(SegmentationPlugin.class);
        registerPlugin(FaceDetectPlugin.class);
        registerPlugin(GallerySavePlugin.class);
        super.onCreate(savedInstanceState);
    }
}

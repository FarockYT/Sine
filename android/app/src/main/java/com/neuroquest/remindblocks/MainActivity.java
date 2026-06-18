package com.neuroquest.remindblocks;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FocusBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

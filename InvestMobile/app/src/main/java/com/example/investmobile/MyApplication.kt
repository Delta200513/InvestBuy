package com.example.investmobile

import android.app.Application
import com.example.investmobile.utils.ThemeManager

class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Инициализируем менеджер темы
        ThemeManager.init(this)
    }
}
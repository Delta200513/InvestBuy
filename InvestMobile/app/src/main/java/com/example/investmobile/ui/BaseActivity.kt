package com.example.investmobile.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.investmobile.utils.ThemeManager

abstract class BaseActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Применяем тему ДО создания активности
        ThemeManager.apply {
            // Тема уже будет применена через AppCompatDelegate
        }
        super.onCreate(savedInstanceState)
    }

    override fun onResume() {
        super.onResume()
        // Перепроверяем тему при возобновлении
        ThemeManager.setTheme(ThemeManager.isDarkMode())
    }
}
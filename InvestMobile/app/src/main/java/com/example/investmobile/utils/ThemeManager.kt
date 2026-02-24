package com.example.investmobile.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatDelegate

object ThemeManager {

    private const val PREFS_NAME = "theme_prefs"
    private const val KEY_IS_DARK_MODE = "is_dark_mode"

    private lateinit var sharedPreferences: SharedPreferences

    fun init(context: Context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // При инициализации применяем сохраненную тему
        val isDarkMode = sharedPreferences.getBoolean(KEY_IS_DARK_MODE, false)
        applyTheme(isDarkMode)
    }

    fun toggleTheme(): Boolean {
        val currentMode = AppCompatDelegate.getDefaultNightMode()
        val isDarkMode = currentMode != AppCompatDelegate.MODE_NIGHT_YES
        saveTheme(isDarkMode)
        applyTheme(isDarkMode)
        return isDarkMode
    }

    fun setTheme(isDarkMode: Boolean) {
        saveTheme(isDarkMode)
        applyTheme(isDarkMode)
    }

    fun isDarkMode(): Boolean {
        return sharedPreferences.getBoolean(KEY_IS_DARK_MODE, false)
    }

    private fun saveTheme(isDarkMode: Boolean) {
        sharedPreferences.edit().putBoolean(KEY_IS_DARK_MODE, isDarkMode).apply()
    }

    private fun applyTheme(isDarkMode: Boolean) {
        if (isDarkMode) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        }
    }
}
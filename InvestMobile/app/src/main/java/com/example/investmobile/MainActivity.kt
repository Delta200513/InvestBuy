package com.example.investmobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.viewpager2.widget.ViewPager2
import com.example.investmobile.ui.BaseActivity
import com.example.investmobile.ui.adapters.MainPagerAdapter
import com.example.investmobile.ui.auth.LoginActivity
import com.example.investmobile.utils.ThemeManager
import com.example.investmobile.utils.UserSession
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator

class MainActivity : BaseActivity() {

    private lateinit var viewPager: ViewPager2
    private lateinit var tabLayout: TabLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Проверяем, есть ли пользователь в сессии
        if (!UserSession.isLoggedIn()) {
            Toast.makeText(this, "Сессия истекла, войдите снова", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        viewPager = findViewById(R.id.viewPager)
        tabLayout = findViewById(R.id.tabLayout)

        setupViewPager()
    }

    private fun setupViewPager() {
        val adapter = MainPagerAdapter(this)
        viewPager.adapter = adapter

        TabLayoutMediator(tabLayout, viewPager) { tab, position ->
            when (position) {
                0 -> tab.text = "Рынок"
                1 -> tab.text = "Портфель"
                2 -> tab.text = "Настройки"
            }
        }.attach()
    }

    override fun onResume() {
        super.onResume()
        if (!UserSession.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}
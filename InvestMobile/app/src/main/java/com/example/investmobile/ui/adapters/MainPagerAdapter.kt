package com.example.investmobile.ui.adapters

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.example.investmobile.ui.dashboard.DashboardFragment
import com.example.investmobile.ui.portfolio.PortfolioFragment
import com.example.investmobile.ui.settings.SettingsFragment

class MainPagerAdapter(activity: FragmentActivity) : FragmentStateAdapter(activity) {

    override fun getItemCount(): Int = 3

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> DashboardFragment()
            1 -> PortfolioFragment()
            2 -> SettingsFragment()
            else -> DashboardFragment()
        }
    }
}
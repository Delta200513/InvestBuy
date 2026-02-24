package com.example.investmobile.data.model

data class PortfolioItem(
    val symbol: String,
    val name: String,
    val quantity: Int,
    val purchasePrice: Double,
    val currentPrice: Double,
    val totalValue: Double,
    val profit: Double
)
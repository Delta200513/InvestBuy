package com.example.investmobile.data.repository

import com.example.investmobile.data.model.PortfolioItem
import com.example.investmobile.data.model.Stock
import com.example.investmobile.data.model.User
import com.example.investmobile.utils.UserSession
import kotlin.random.Random

object DataRepository {

    private var userPortfolio = mutableListOf<PortfolioItem>()
    private var userBudget = 100000.0

    // Хранилище пользователей (email -> пара (user, password))
    private val users = mutableMapOf<String, Pair<User, String>>()

    // Для теста добавим тестового пользователя
    init {
        // Тестовый пользователь для быстрого входа
        val testUser = User(
            id = "test123",
            email = "test@test.com",
            name = "Тестовый пользователь",
            budget = 100000.0
        )
        users["test@test.com"] = Pair(testUser, "password123")
    }

    // Список доступных акций
    private val availableStocks = listOf(
        Stock("AAPL", "Apple Inc.", 175.50, 2.30, 1.33),
        Stock("GOOGL", "Alphabet Inc.", 138.20, -0.80, -0.58),
        Stock("MSFT", "Microsoft Corp.", 378.85, 5.20, 1.39),
        Stock("AMZN", "Amazon.com Inc.", 145.30, -1.20, -0.82),
        Stock("TSLA", "Tesla Inc.", 245.60, 8.40, 3.54),
        Stock("META", "Meta Platforms", 325.40, -2.10, -0.64),
        Stock("NFLX", "Netflix Inc.", 485.90, 12.30, 2.60),
        Stock("NVDA", "NVIDIA Corp.", 785.30, 25.40, 3.34)
    )

    // Получить список всех акций
    fun getStocks(): List<Stock> {
        return availableStocks.map { stock ->
            val change = (Random.nextDouble() * 10 - 5)
            val newPrice = stock.price + change
            stock.copy(
                price = newPrice,
                change = change,
                changePercent = (change / stock.price) * 100
            )
        }
    }

    // Получить пользователя по email
    fun getUserByEmail(email: String): User? {
        return users[email]?.first
    }

    // Регистрация пользователя
    fun register(email: String, name: String, password: String): User? {
        if (users.containsKey(email)) {
            return null
        }

        val user = User(
            id = System.currentTimeMillis().toString(),
            email = email,
            name = name,
            budget = 100000.0
        )

        users[email] = Pair(user, password)

        // Сохраняем в сессию
        UserSession.setUser(user)
        userBudget = 100000.0
        userPortfolio.clear()

        return user
    }

    // Вход пользователя
    fun login(email: String, password: String): User? {
        val pair = users[email] ?: return null

        return if (pair.second == password) {
            val user = pair.first
            // Сохраняем в сессию
            UserSession.setUser(user)
            userBudget = user.budget
            user
        } else {
            null
        }
    }

    // Получить текущего пользователя из сессии
    fun getCurrentUser(): User? = UserSession.currentUser

    // Выход
    fun logout() {
        UserSession.clear()
        userPortfolio.clear()
        userBudget = 100000.0
    }

    // Получить портфель пользователя
    fun getPortfolio(): List<PortfolioItem> {
        return userPortfolio.map { item ->
            val currentStock = availableStocks.find { it.symbol == item.symbol }!!
            val currentPrice = currentStock.price
            item.copy(
                currentPrice = currentPrice,
                totalValue = currentPrice * item.quantity,
                profit = (currentPrice - item.purchasePrice) * item.quantity
            )
        }
    }

    // Получить баланс
    fun getBudget(): Double = userBudget

    // Купить акцию
    fun buyStock(symbol: String, quantity: Int, price: Double): Boolean {
        val totalCost = price * quantity
        if (totalCost > userBudget) return false

        userBudget -= totalCost

        val existingItem = userPortfolio.find { it.symbol == symbol }
        if (existingItem != null) {
            val newQuantity = existingItem.quantity + quantity
            val newAvgPrice = (existingItem.purchasePrice * existingItem.quantity + totalCost) / newQuantity
            userPortfolio.remove(existingItem)
            userPortfolio.add(
                PortfolioItem(
                    symbol = symbol,
                    name = existingItem.name,
                    quantity = newQuantity,
                    purchasePrice = newAvgPrice,
                    currentPrice = price,
                    totalValue = price * newQuantity,
                    profit = 0.0
                )
            )
        } else {
            val stock = availableStocks.find { it.symbol == symbol }!!
            userPortfolio.add(
                PortfolioItem(
                    symbol = symbol,
                    name = stock.name,
                    quantity = quantity,
                    purchasePrice = price,
                    currentPrice = price,
                    totalValue = price * quantity,
                    profit = 0.0
                )
            )
        }

        // Обновляем бюджет пользователя в сессии
        UserSession.currentUser?.let { user ->
            val updatedUser = user.copy(budget = userBudget)
            UserSession.setUser(updatedUser)
            // Обновляем в хранилище
            users[user.email] = Pair(updatedUser, users[user.email]!!.second)
        }

        return true
    }

    // Продать акцию
    fun sellStock(symbol: String, quantity: Int, price: Double): Boolean {
        val item = userPortfolio.find { it.symbol == symbol } ?: return false
        if (item.quantity < quantity) return false

        val totalValue = price * quantity
        userBudget += totalValue

        if (item.quantity == quantity) {
            userPortfolio.remove(item)
        } else {
            val newQuantity = item.quantity - quantity
            userPortfolio.remove(item)
            userPortfolio.add(
                item.copy(
                    quantity = newQuantity,
                    totalValue = price * newQuantity
                )
            )
        }

        // Обновляем бюджет пользователя в сессии
        UserSession.currentUser?.let { user ->
            val updatedUser = user.copy(budget = userBudget)
            UserSession.setUser(updatedUser)
            users[user.email] = Pair(updatedUser, users[user.email]!!.second)
        }

        return true
    }

    // Пополнить баланс
    fun deposit(amount: Double) {
        userBudget += amount

        UserSession.currentUser?.let { user ->
            val updatedUser = user.copy(budget = userBudget)
            UserSession.setUser(updatedUser)
            users[user.email] = Pair(updatedUser, users[user.email]!!.second)
        }
    }

    fun saveAvatarUri(uri: String) {
        UserSession.currentUser?.let { user ->
            val updatedUser = user.copy(avatarUri = uri)
            UserSession.setUser(updatedUser)

            // Обновляем в хранилище пользователей
            users[user.email] = Pair(updatedUser, users[user.email]!!.second)
        }
    }

    // Получить URI аватарки
    fun getAvatarUri(): String? {
        return UserSession.currentUser?.avatarUri
    }
}
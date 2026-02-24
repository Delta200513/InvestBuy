package com.example.investmobile.utils

import com.example.investmobile.data.model.User

object UserSession {
    var currentUser: User? = null
        private set

    fun setUser(user: User) {
        currentUser = user
    }

    fun clear() {
        currentUser = null
    }

    fun isLoggedIn(): Boolean = currentUser != null

    // Обновить аватарку
    fun updateAvatar(avatarUri: String) {
        currentUser = currentUser?.copy(avatarUri = avatarUri)
    }

    // Получить аватарку
    fun getAvatarUri(): String? = currentUser?.avatarUri

    // Обновить имя
    fun updateName(newName: String) {
        currentUser = currentUser?.copy(name = newName)
    }

    // Обновить бюджет
    fun updateBudget(newBudget: Double) {
        currentUser = currentUser?.copy(budget = newBudget)
    }
}
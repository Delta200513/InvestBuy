package com.example.investmobile.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.example.investmobile.MainActivity
import com.example.investmobile.R
import com.example.investmobile.data.repository.DataRepository
import com.example.investmobile.ui.BaseActivity
import com.example.investmobile.utils.ThemeManager
import com.example.investmobile.utils.UserSession

class LoginActivity : BaseActivity() {

    private val TAG = "LoginActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val etEmail = findViewById<android.widget.EditText>(R.id.etEmail)
        val etPassword = findViewById<android.widget.EditText>(R.id.etPassword)
        val btnLogin = findViewById<android.widget.Button>(R.id.btnLogin)
        val tvRegister = findViewById<android.widget.TextView>(R.id.tvRegister)

        // Для теста - заполняем тестовыми данными
        etEmail.setText("test@test.com")
        etPassword.setText("password123")

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            Log.d(TAG, "Попытка входа: email=$email")

            if (email.isEmpty()) {
                etEmail.error = "Введите email"
                etEmail.requestFocus()
                return@setOnClickListener
            }

            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                etEmail.error = "Введите корректный email"
                etEmail.requestFocus()
                return@setOnClickListener
            }

            if (password.isEmpty()) {
                etPassword.error = "Введите пароль"
                etPassword.requestFocus()
                return@setOnClickListener
            }

            val user = DataRepository.login(email, password)

            if (user != null) {
                Log.d(TAG, "Вход успешен: ${user.name}")
                Toast.makeText(this, "Добро пожаловать, ${user.name}!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                Log.e(TAG, "Ошибка входа: неверный email или пароль")
                Toast.makeText(this, "Неверный email или пароль", Toast.LENGTH_SHORT).show()
            }
        }

        tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
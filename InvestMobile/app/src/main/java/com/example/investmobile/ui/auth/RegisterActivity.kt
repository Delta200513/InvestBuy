package com.example.investmobile.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.example.investmobile.MainActivity
import com.example.investmobile.R
import com.example.investmobile.data.repository.DataRepository
import com.example.investmobile.ui.BaseActivity
import com.example.investmobile.utils.UserSession

class RegisterActivity : BaseActivity() {

    private val TAG = "RegisterActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etName = findViewById<android.widget.EditText>(R.id.etName)
        val etEmail = findViewById<android.widget.EditText>(R.id.etEmail)
        val etPassword = findViewById<android.widget.EditText>(R.id.etPassword)
        val etConfirmPassword = findViewById<android.widget.EditText>(R.id.etConfirmPassword)
        val btnRegister = findViewById<android.widget.Button>(R.id.btnRegister)
        val tvLogin = findViewById<android.widget.TextView>(R.id.tvLogin)

        btnRegister.setOnClickListener {
            val name = etName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()
            val confirmPassword = etConfirmPassword.text.toString()

            Log.d(TAG, "Попытка регистрации: name=$name, email=$email")

            when {
                name.isEmpty() -> {
                    etName.error = "Введите имя"
                    etName.requestFocus()
                }
                name.length < 2 -> {
                    etName.error = "Имя должно содержать минимум 2 символа"
                    etName.requestFocus()
                }
                email.isEmpty() -> {
                    etEmail.error = "Введите email"
                    etEmail.requestFocus()
                }
                !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                    etEmail.error = "Введите корректный email"
                    etEmail.requestFocus()
                }
                password.isEmpty() -> {
                    etPassword.error = "Введите пароль"
                    etPassword.requestFocus()
                }
                password.length < 6 -> {
                    etPassword.error = "Пароль должен содержать минимум 6 символов"
                    etPassword.requestFocus()
                }
                !password.any { it.isDigit() } || !password.any { it.isLetter() } -> {
                    etPassword.error = "Пароль должен содержать буквы и цифры"
                    etPassword.requestFocus()
                }
                confirmPassword.isEmpty() -> {
                    etConfirmPassword.error = "Подтвердите пароль"
                    etConfirmPassword.requestFocus()
                }
                password != confirmPassword -> {
                    etConfirmPassword.error = "Пароли не совпадают"
                    etConfirmPassword.requestFocus()
                }
                DataRepository.getUserByEmail(email) != null -> {
                    etEmail.error = "Пользователь с таким email уже существует"
                    etEmail.requestFocus()
                }
                else -> {
                    val user = DataRepository.register(email, name, password)

                    if (user != null) {
                        Log.d(TAG, "Регистрация успешна: ${user.name}")
                        Toast.makeText(this, "Регистрация успешна!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this, MainActivity::class.java))
                        finish()
                    } else {
                        Log.e(TAG, "Ошибка при регистрации")
                        Toast.makeText(this, "Ошибка при регистрации", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        tvLogin.setOnClickListener {
            finish()
        }
    }
}
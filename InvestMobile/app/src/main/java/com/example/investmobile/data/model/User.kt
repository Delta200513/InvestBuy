package com.example.investmobile.data.model

import android.os.Parcel
import android.os.Parcelable
import java.io.Serializable

data class User(
    val id: String,
    val email: String,
    val name: String,
    val budget: Double = 100000.0,
    var avatarUri: String? = null
) : Serializable  // Используем Serializable вместо Parcelize
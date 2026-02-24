package com.example.investmobile.ui.settings
import android.content.Context
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import com.example.investmobile.R
import com.example.investmobile.data.repository.DataRepository
import com.example.investmobile.ui.auth.LoginActivity
import com.example.investmobile.utils.ThemeManager
import com.example.investmobile.utils.UserSession
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SettingsFragment : Fragment() {

    private val TAG = "SettingsFragment"
    private var currentPhotoPath: String? = null

    // Регистрация для выбора фото из галереи
    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let {
            saveAvatarToInternalStorage(it)
        }
    }

    // Регистрация для съемки фото камерой
    private val takePictureLauncher = registerForActivityResult(ActivityResultContracts.TakePicture()) { success ->
        if (success) {
            currentPhotoPath?.let { path ->
                val file = File(path)
                if (file.exists()) {
                    val uri = Uri.fromFile(file)
                    saveAvatarToInternalStorage(uri)
                }
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val ivAvatar = view.findViewById<ImageView>(R.id.ivAvatar)
        val tvName = view.findViewById<android.widget.TextView>(R.id.tvName)
        val tvEmail = view.findViewById<android.widget.TextView>(R.id.tvEmail)
        val switchTheme = view.findViewById<androidx.appcompat.widget.SwitchCompat>(R.id.switchTheme)
        val switchNotifications = view.findViewById<androidx.appcompat.widget.SwitchCompat>(R.id.switchNotifications)
        val tvLanguage = view.findViewById<android.widget.TextView>(R.id.tvLanguage)
        val btnLogout = view.findViewById<android.widget.Button>(R.id.btnLogout)

        // Устанавливаем начальное состояние переключателя темы
        switchTheme.isChecked = ThemeManager.isDarkMode()

        // Загружаем информацию о пользователе
        loadUserInfo(tvName, tvEmail, ivAvatar)

        // Обработчик нажатия на аватарку
        ivAvatar.setOnClickListener {
            showAvatarSourceDialog()
        }

        // Обработчик переключателя темы
        switchTheme.setOnCheckedChangeListener { _, isChecked ->
            Log.d(TAG, "Переключение темы: isChecked=$isChecked")
            ThemeManager.setTheme(isChecked)
            Toast.makeText(requireContext(),
                if (isChecked) "Темная тема включена" else "Светлая тема включена",
                Toast.LENGTH_SHORT).show()
            requireActivity().recreate()
        }

        // Обработчик переключателя уведомлений
        switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            Toast.makeText(requireContext(),
                if (isChecked) "Уведомления включены" else "Уведомления отключены",
                Toast.LENGTH_SHORT).show()
        }

        // Обработчик выбора языка
        tvLanguage.setOnClickListener {
            Toast.makeText(requireContext(), "Смена языка будет доступна в следующей версии", Toast.LENGTH_SHORT).show()
        }

        // Обработчик выхода
        btnLogout.setOnClickListener {
            DataRepository.logout()
            startActivity(Intent(requireContext(), LoginActivity::class.java))
            requireActivity().finish()
            Toast.makeText(requireContext(), "Выход выполнен", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showAvatarSourceDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_avatar, null)

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        dialogView.findViewById<android.widget.Button>(R.id.btnCamera).setOnClickListener {
            dispatchTakePictureIntent()
            dialog.dismiss()
        }

        dialogView.findViewById<android.widget.Button>(R.id.btnGallery).setOnClickListener {
            pickImageLauncher.launch("image/*")
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun dispatchTakePictureIntent() {
        val photoFile = try {
            createImageFile()
        } catch (ex: IOException) {
            Toast.makeText(requireContext(), "Ошибка создания файла", Toast.LENGTH_SHORT).show()
            return
        }

        photoFile?.also {
            val photoURI = FileProvider.getUriForFile(
                requireContext(),
                "${requireContext().packageName}.fileprovider",
                it
            )
            currentPhotoPath = it.absolutePath
            takePictureLauncher.launch(photoURI)
        }
    }

    private fun createImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = requireContext().getExternalFilesDir(null)
        return File.createTempFile(
            "JPEG_${timeStamp}_",
            ".jpg",
            storageDir
        ).apply {
            currentPhotoPath = absolutePath
        }
    }

    private fun saveAvatarToInternalStorage(uri: Uri) {
        try {
            // Копируем изображение во внутреннее хранилище приложения
            val inputStream = requireContext().contentResolver.openInputStream(uri)
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val fileName = "avatar_${timeStamp}.jpg"

            val outputStream = requireContext().openFileOutput(fileName, Context.MODE_PRIVATE)

            inputStream?.use { input ->
                outputStream.use { output ->
                    input.copyTo(output)
                }
            }

            // Сохраняем путь к файлу
            val savedUri = Uri.fromFile(File(requireContext().filesDir, fileName)).toString()
            DataRepository.saveAvatarUri(savedUri)  // Сохраняем в репозитории
            UserSession.updateAvatar(savedUri)      // Обновляем в сессии

            // Обновляем отображение аватарки
            val tvName = view?.findViewById<android.widget.TextView>(R.id.tvName)
            val tvEmail = view?.findViewById<android.widget.TextView>(R.id.tvEmail)
            val ivAvatar = view?.findViewById<ImageView>(R.id.ivAvatar)
            if (tvName != null && tvEmail != null && ivAvatar != null) {
                loadUserInfo(tvName, tvEmail, ivAvatar)
            }

            Toast.makeText(requireContext(), "Аватарка сохранена", Toast.LENGTH_SHORT).show()

        } catch (e: Exception) {
            Log.e(TAG, "Ошибка сохранения аватарки", e)
            Toast.makeText(requireContext(), "Ошибка сохранения аватарки", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadUserInfo(tvName: android.widget.TextView, tvEmail: android.widget.TextView, ivAvatar: ImageView) {
        val user = UserSession.currentUser
        Log.d(TAG, "loadUserInfo: user = $user")

        if (user != null) {
            tvName.text = user.name
            tvEmail.text = user.email

            // Загружаем аватарку если есть
            user.avatarUri?.let { uriString ->
                try {
                    val uri = Uri.parse(uriString)
                    val bitmap = BitmapFactory.decodeStream(requireContext().contentResolver.openInputStream(uri))
                    ivAvatar.setImageBitmap(bitmap)
                    ivAvatar.scaleType = ImageView.ScaleType.CENTER_CROP
                } catch (e: Exception) {
                    Log.e(TAG, "Ошибка загрузки аватарки", e)
                    ivAvatar.setImageResource(android.R.drawable.sym_def_app_icon)
                }
            } ?: run {
                ivAvatar.setImageResource(android.R.drawable.sym_def_app_icon)
            }

            Log.d(TAG, "Имя: ${user.name}, Email: ${user.email}, Аватарка: ${user.avatarUri}")
        } else {
            tvName.text = "Гость"
            tvEmail.text = "не авторизован"
            ivAvatar.setImageResource(android.R.drawable.sym_def_app_icon)
            Log.e(TAG, "Пользователь не найден в сессии!")
        }
    }

    override fun onResume() {
        super.onResume()
        // Обновляем информацию при возврате на фрагмент
        val tvName = view?.findViewById<android.widget.TextView>(R.id.tvName)
        val tvEmail = view?.findViewById<android.widget.TextView>(R.id.tvEmail)
        val ivAvatar = view?.findViewById<ImageView>(R.id.ivAvatar)
        if (tvName != null && tvEmail != null && ivAvatar != null) {
            loadUserInfo(tvName, tvEmail, ivAvatar)
        }

        // Обновляем состояние переключателя темы
        val switchTheme = view?.findViewById<androidx.appcompat.widget.SwitchCompat>(R.id.switchTheme)
        switchTheme?.isChecked = ThemeManager.isDarkMode()
    }
}
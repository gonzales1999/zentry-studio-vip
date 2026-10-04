package com.aistudio.zentry

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.aistudio.zentry.data.local.ZentryDatabase
import com.aistudio.zentry.data.repository.ZentryRepository
import com.aistudio.zentry.ui.screens.EditorScreen
import com.aistudio.zentry.ui.theme.BgDark
import com.aistudio.zentry.ui.theme.ZentryStudioTheme
import com.aistudio.zentry.viewmodel.AdminViewModel
import com.aistudio.zentry.viewmodel.EditorViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = ZentryDatabase.getDatabase(applicationContext)
        val repository = ZentryRepository(
            projectDao = database.projectDao(),
            profileDao = database.profileDao()
        )

        val editorViewModel = EditorViewModel(repository)
        val adminViewModel = AdminViewModel(repository)

        setContent {
            ZentryStudioTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BgDark
                ) {
                    EditorScreen(
                        editorViewModel = editorViewModel,
                        adminViewModel = adminViewModel,
                        repository = repository
                    )
                }
            }
        }
    }
}

package com.aistudio.zentry.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.aistudio.zentry.data.model.CaptionItem
import com.aistudio.zentry.data.model.ProjectDraft
import com.aistudio.zentry.data.model.UserProfile

@Database(
    entities = [ProjectDraft::class, CaptionItem::class, UserProfile::class],
    version = 1,
    exportSchema = false
)
abstract class ZentryDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao
    abstract fun profileDao(): ProfileDao

    companion object {
        @Volatile
        private var INSTANCE: ZentryDatabase? = null

        fun getDatabase(context: Context): ZentryDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ZentryDatabase::class.java,
                    "zentry_studio_db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}

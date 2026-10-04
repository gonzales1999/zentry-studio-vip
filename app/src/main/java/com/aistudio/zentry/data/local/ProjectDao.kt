package com.aistudio.zentry.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.aistudio.zentry.data.model.CaptionItem
import com.aistudio.zentry.data.model.ProjectDraft
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects WHERE id = :id LIMIT 1")
    fun getProjectById(id: String): Flow<ProjectDraft?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveProject(project: ProjectDraft)

    @Query("SELECT * FROM captions ORDER BY startMs ASC")
    fun getAllCaptions(): Flow<List<CaptionItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCaptions(captions: List<CaptionItem>)

    @Query("DELETE FROM captions")
    suspend fun clearCaptions()

    @Update
    suspend fun updateCaption(caption: CaptionItem)
}

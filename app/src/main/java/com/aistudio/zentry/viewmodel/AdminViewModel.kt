package com.aistudio.zentry.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aistudio.zentry.data.model.UserProfile
import com.aistudio.zentry.data.repository.ZentryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class AdminViewModel(
    private val repository: ZentryRepository
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery

    val profiles: StateFlow<List<UserProfile>> = repository.profilesFlow
        .combine(_searchQuery) { list, query ->
            if (query.isBlank()) list
            else list.filter {
                it.fullName.contains(query, ignoreCase = true) ||
                it.email.contains(query, ignoreCase = true) ||
                it.role.contains(query, ignoreCase = true)
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun toggleVip(userId: String, currentVip: Boolean) {
        viewModelScope.launch {
            repository.setVipStatus(userId, !currentVip)
        }
    }

    fun adjustCredits(userId: String, currentCredits: Int, delta: Int) {
        viewModelScope.launch {
            val newCredits = (currentCredits + delta).coerceAtLeast(0)
            repository.updateCredits(userId, newCredits)
        }
    }
}

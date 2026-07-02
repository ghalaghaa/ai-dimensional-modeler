package com.clinicmanager.service;

import com.clinicmanager.dto.InventoryItemResponse;
import com.clinicmanager.entity.InventoryItem;
import com.clinicmanager.repository.InventoryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryItemServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    private InventoryItemService inventoryItemService;

    @BeforeEach
    void setUp() {
        inventoryItemService = new InventoryItemService(inventoryItemRepository);
    }

    @Test
    void findLowStock_returnsOnlyItemsAtOrBelowThreshold() {
        InventoryItem belowThreshold = new InventoryItem("Amoxicillin", 5, "box", 10);
        InventoryItem atThreshold = new InventoryItem("Bandages", 20, "pack", 20);
        InventoryItem aboveThreshold = new InventoryItem("Gloves", 500, "box", 50);

        when(inventoryItemRepository.findAll()).thenReturn(List.of(belowThreshold, atThreshold, aboveThreshold));

        List<InventoryItemResponse> lowStock = inventoryItemService.findLowStock();

        assertThat(lowStock).hasSize(2);
        assertThat(lowStock).extracting(InventoryItemResponse::getName)
                .containsExactlyInAnyOrder("Amoxicillin", "Bandages");
    }

    @Test
    void findLowStock_returnsEmptyListWhenNoItemsAreLow() {
        InventoryItem wellStocked = new InventoryItem("Syringes", 1000, "unit", 100);
        when(inventoryItemRepository.findAll()).thenReturn(List.of(wellStocked));

        List<InventoryItemResponse> lowStock = inventoryItemService.findLowStock();

        assertThat(lowStock).isEmpty();
    }

    @Test
    void findLowStock_returnsEmptyListWhenNoInventoryExists() {
        when(inventoryItemRepository.findAll()).thenReturn(List.of());

        List<InventoryItemResponse> lowStock = inventoryItemService.findLowStock();

        assertThat(lowStock).isEmpty();
    }
}

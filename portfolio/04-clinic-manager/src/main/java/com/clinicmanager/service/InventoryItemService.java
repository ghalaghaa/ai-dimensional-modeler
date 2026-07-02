package com.clinicmanager.service;

import com.clinicmanager.dto.InventoryItemRequest;
import com.clinicmanager.dto.InventoryItemResponse;
import com.clinicmanager.entity.InventoryItem;
import com.clinicmanager.exception.ResourceNotFoundException;
import com.clinicmanager.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public InventoryItemResponse create(InventoryItemRequest request) {
        InventoryItem item = new InventoryItem(
                request.getName(), request.getQuantity(), request.getUnit(), request.getReorderThreshold());
        return new InventoryItemResponse(inventoryItemRepository.save(item));
    }

    public List<InventoryItemResponse> findAll() {
        return inventoryItemRepository.findAll().stream().map(InventoryItemResponse::new).toList();
    }

    public InventoryItemResponse findById(Long id) {
        return new InventoryItemResponse(getItemOrThrow(id));
    }

    public InventoryItemResponse update(Long id, InventoryItemRequest request) {
        InventoryItem item = getItemOrThrow(id);
        item.setName(request.getName());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setReorderThreshold(request.getReorderThreshold());
        return new InventoryItemResponse(inventoryItemRepository.save(item));
    }

    public void delete(Long id) {
        InventoryItem item = getItemOrThrow(id);
        inventoryItemRepository.delete(item);
    }

    public List<InventoryItemResponse> findLowStock() {
        return inventoryItemRepository.findAll().stream()
                .filter(item -> item.getQuantity() <= item.getReorderThreshold())
                .map(InventoryItemResponse::new)
                .toList();
    }

    private InventoryItem getItemOrThrow(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id " + id));
    }
}

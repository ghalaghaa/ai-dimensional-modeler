package com.clinicmanager.controller;

import com.clinicmanager.dto.InventoryItemRequest;
import com.clinicmanager.dto.InventoryItemResponse;
import com.clinicmanager.service.InventoryItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> create(@Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryItemService.create(request));
    }

    @GetMapping
    public List<InventoryItemResponse> findAll() {
        return inventoryItemService.findAll();
    }

    @GetMapping("/low-stock")
    public List<InventoryItemResponse> findLowStock() {
        return inventoryItemService.findLowStock();
    }

    @GetMapping("/{id}")
    public InventoryItemResponse findById(@PathVariable Long id) {
        return inventoryItemService.findById(id);
    }

    @PutMapping("/{id}")
    public InventoryItemResponse update(@PathVariable Long id, @Valid @RequestBody InventoryItemRequest request) {
        return inventoryItemService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

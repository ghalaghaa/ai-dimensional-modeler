package com.clinicmanager.dto;

import com.clinicmanager.entity.InventoryItem;

public class InventoryItemResponse {

    private Long id;
    private String name;
    private int quantity;
    private String unit;
    private int reorderThreshold;

    public InventoryItemResponse() {
    }

    public InventoryItemResponse(InventoryItem item) {
        this.id = item.getId();
        this.name = item.getName();
        this.quantity = item.getQuantity();
        this.unit = item.getUnit();
        this.reorderThreshold = item.getReorderThreshold();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public int getReorderThreshold() {
        return reorderThreshold;
    }

    public void setReorderThreshold(int reorderThreshold) {
        this.reorderThreshold = reorderThreshold;
    }
}

package com.clinicmanager.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class InventoryItemRequest {

    @NotBlank(message = "name is required")
    private String name;

    @Min(value = 0, message = "quantity cannot be negative")
    private int quantity;

    @NotBlank(message = "unit is required")
    private String unit;

    @Min(value = 0, message = "reorderThreshold cannot be negative")
    private int reorderThreshold;

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

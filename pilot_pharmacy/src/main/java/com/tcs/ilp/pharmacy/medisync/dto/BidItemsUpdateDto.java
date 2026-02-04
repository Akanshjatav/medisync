package com.tcs.ilp.pharmacy.medisync.dto;

import java.util.List;

public class BidItemsUpdateDto {
    // required; can be [] to clear
    private List<BidItemDto> items;

    public List<BidItemDto> getItems() { return items; }
    public void setItems(List<BidItemDto> items) { this.items = items; }
}

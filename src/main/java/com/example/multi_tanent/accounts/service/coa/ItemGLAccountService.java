package com.example.multi_tanent.accounts.service.coa;

import com.example.multi_tanent.accounts.dto.coa.ItemGLAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.ItemGLAccountResponse;

import java.util.List;

public interface ItemGLAccountService {
    ItemGLAccountResponse save(ItemGLAccountRequest request);
    ItemGLAccountResponse getByItemId(Long itemId);
    List<ItemGLAccountResponse> getAll();
    void delete(Long id);
}

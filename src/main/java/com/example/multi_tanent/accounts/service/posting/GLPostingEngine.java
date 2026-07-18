package com.example.multi_tanent.accounts.service.posting;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;

public interface GLPostingEngine {
    PostingResult postDocument(PostingRequest request, String username);
    PostingResult reverseDocument(Long journalEntryId, String username);
}

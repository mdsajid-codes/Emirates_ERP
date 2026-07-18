package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.purchases.dto.PurRfqQuestionRequest;
import com.example.multi_tanent.purchases.dto.PurRfqQuestionResponse;
import com.example.multi_tanent.purchases.entity.PurRfqQuestion;
import com.example.multi_tanent.purchases.repository.PurRfqQuestionRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurRfqQuestionService {

    private final PurRfqQuestionRepository questionRepo;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public PurRfqQuestionResponse create(PurRfqQuestionRequest req) {
        PurRfqQuestion q = new PurRfqQuestion();
        q.setQuestionText(req.getQuestionText());
        q.setTenant(currentTenant());

        PurRfqQuestion saved = questionRepo.save(q);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PurRfqQuestionResponse> list(Pageable pageable) {
        return questionRepo.findByTenantId(currentTenant().getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurRfqQuestionResponse getById(Long id) {
        PurRfqQuestion q = questionRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
        return toResponse(q);
    }

    public PurRfqQuestionResponse update(Long id, PurRfqQuestionRequest req) {
        PurRfqQuestion q = questionRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        q.setQuestionText(req.getQuestionText());
        return toResponse(questionRepo.save(q));
    }

    public void delete(Long id) {
        PurRfqQuestion q = questionRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
        questionRepo.delete(q);
    }

    private PurRfqQuestionResponse toResponse(PurRfqQuestion q) {
        return PurRfqQuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .build();
    }
}

package com.example.multi_tanent.crm.converters;

import com.example.multi_tanent.crm.enums.CrmStageMoveTo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CrmStageMoveToConverter implements AttributeConverter<CrmStageMoveTo, String> {

    @Override
    public String convertToDatabaseColumn(CrmStageMoveTo attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public CrmStageMoveTo convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return CrmStageMoveTo.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

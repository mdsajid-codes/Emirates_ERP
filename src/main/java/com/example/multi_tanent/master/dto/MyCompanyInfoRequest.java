package com.example.multi_tanent.master.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

@Data
public class MyCompanyInfoRequest {

    private String companyName;

    // Files are transient, not serialized
    private MultipartFile logoImage;
    private MultipartFile signatureImage;
    private MultipartFile stampImage;
    private MultipartFile invoiceHeaderImage;
    private MultipartFile invoiceFooterImage;
    private MultipartFile watermarkImage;

    // Address fields
    private String address;
    private String city;
    private String emirate;
    private String poBox;
    private String country;
    private String phone;
    private String email;
    private String website;

    // UAE fields
    private String tradeLicenseNumber;
    private LocalDate tradeLicenseExpiry;
    private String trn;
    private String mohreEstablishmentId;
    private Integer visaQuotaTotal;
    private String employerBankRoutingCode;

    // JSON strings or mapped objects (handled as strings if coming from FormData
    // mostly,
    // but Spring can map list of objects if Content-Type is application/json.
    // However, with Multipart, it's often easier to receive these as JSON strings
    // and parse them,
    // or use @RequestPart. For simplicity with @ModelAttribute, Lists often work if
    // indexed correctly).
    private List<MyBankDetailsRequest> bankDetails;
    private List<MyCustomFieldRequest> customFields;
}

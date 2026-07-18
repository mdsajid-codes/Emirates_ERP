package com.example.multi_tanent.master.service;

import com.example.multi_tanent.master.dto.MyCompanyInfoRequest;
import com.example.multi_tanent.master.dto.MyCompanyInfoResponse;

import org.springframework.core.io.Resource;
import java.io.IOException;

public interface MyCompanyInfoService {
    MyCompanyInfoResponse saveOrUpdateCompanyInfo(MyCompanyInfoRequest request) throws IOException;

    MyCompanyInfoResponse getCompanyInfo();

    void deleteCompanyInfo();

    Resource loadFileAsResource(String fileName) throws IOException;
}

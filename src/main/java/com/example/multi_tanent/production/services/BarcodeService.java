package com.example.multi_tanent.production.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class BarcodeService {

    /**
     * Generates a CODE_128 barcode image for the given text.
     * @param text The text to encode in the barcode.
     * @param width The desired width of the barcode image.
     * @param height The desired height of the barcode image.
     * @return A byte array representing the PNG image of the barcode.
     */
    public byte[] generateBarcodeImage(String text, int width, int height) {
        try {
            Code128Writer barcodeWriter = new Code128Writer();
            BitMatrix bitMatrix = barcodeWriter.encode(text, BarcodeFormat.CODE_128, width, height);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate barcode image", e);
        }
    }
}
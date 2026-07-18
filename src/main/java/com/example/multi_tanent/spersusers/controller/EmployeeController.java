package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.dto.EmployeeRequest;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.enums.EmployeeStatus;
import com.example.multi_tanent.spersusers.enums.Gender;
import com.example.multi_tanent.spersusers.enums.MartialStatus;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.tenant.employee.service.EmployeeService;
import com.example.multi_tanent.tenant.service.FileStorageService;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin (origins = "*")
@Transactional(transactionManager = "tenantTx")
public class EmployeeController {
  private final EmployeeRepository empRepo;
  private final EmployeeService employeeService;
  private final UserRepository userRepo;
  private final FileStorageService fileStorageService;
  private final LocationRepository locationRepository;
  private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);


  public EmployeeController(EmployeeRepository empRepo,
                            EmployeeService employeeService,
                            UserRepository userRepo,
                            FileStorageService fileStorageService,
                            LocationRepository locationRepository) {
    this.empRepo = empRepo;
    this.employeeService = employeeService;
    this.userRepo = userRepo;
    this.fileStorageService = fileStorageService;
    this.locationRepository = locationRepository;
  }

  @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  public ResponseEntity<?> registerEmployee(@RequestBody EmployeeRequest request){
    try {
        Employee savedEmployee = employeeService.registerEmployee(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/api/employees/{employeeCode}")
                .buildAndExpand(savedEmployee.getEmployeeCode()).toUri();
        return ResponseEntity.created(location).body(savedEmployee);
    } catch (IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }
  }

  @GetMapping("/bulk-template")
  @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  public ResponseEntity<byte[]> downloadBulkAddTemplate() throws IOException {
      String[] headers = {
              "User Email*", "Employee Code*", "Full Name*", "Password*", "Roles (comma-separated)*",
              "First Name*", "Last Name*", "Work Email", "Primary Phone", "Date of Birth (YYYY-MM-DD)", "Location Name",
              "Gender (MALE/FEMALE/OTHER)", "Address", "City", "State", "Country", "Postal Code",
              "Bank Name", "Bank Account Number", "IFSC Code", "Designation", "Department",
              "Date of Joining (YYYY-MM-DD)", "Reports To (Manager's Employee Code)"
      };

      try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
          Sheet sheet = workbook.createSheet("Employees");

          // Create header row with bold font
          Row headerRow = sheet.createRow(0);
          CellStyle headerCellStyle = workbook.createCellStyle();
          Font font = workbook.createFont();
          font.setBold(true);
          headerCellStyle.setFont(font);

          for (int col = 0; col < headers.length; col++) {
              Cell cell = headerRow.createCell(col);
              cell.setCellValue(headers[col]);
              cell.setCellStyle(headerCellStyle);
              sheet.autoSizeColumn(col);
          }

          // Add example data row for reference
          Row exampleRow = sheet.createRow(1);
          String[] exampleData = {
                  "john.doe@example.com", "EMP001", "John Doe", "password123", "EMPLOYEE",
                  "John", "Doe", "john.doe.work@example.com", "1234567890", "1990-05-20", "Headquarters",
                  "MALE", "123 Main Street", "New York", "NY", "USA", "10001",
                  "Chase Bank", "9876543210", "CHASUS33", "Software Engineer", "Engineering",
                  "2023-01-15", "EMP000"
          };
          for (int col = 0; col < exampleData.length; col++) {
              exampleRow.createCell(col).setCellValue(exampleData[col]);
          }

          // Add a second sheet with instructions and valid values
          Sheet instructionsSheet = workbook.createSheet("Instructions");
          Row infoRow1 = instructionsSheet.createRow(0);
          infoRow1.createCell(0).setCellValue("Instructions for Bulk Employee Upload");

          instructionsSheet.createRow(2).createCell(0).setCellValue("Columns marked with * are mandatory.");
          instructionsSheet.createRow(3).createCell(0).setCellValue("Date Format: Please use YYYY-MM-DD for all date fields.");
          instructionsSheet.createRow(4).createCell(0).setCellValue("Gender: Valid values are MALE, FEMALE, OTHER (case-insensitive).");
          instructionsSheet.createRow(5).createCell(0).setCellValue("Roles: Provide a comma-separated list of roles (e.g., EMPLOYEE,MANAGER).");
          instructionsSheet.createRow(6).createCell(0).setCellValue("Leave Group: Ensure the Leave Group Name exists in the system before uploading.");

          for (int i = 0; i < 2; i++) {
              instructionsSheet.autoSizeColumn(i);
          }

          workbook.write(out);

          HttpHeaders responseHeaders = new HttpHeaders();
          responseHeaders.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
          responseHeaders.setContentDispositionFormData("attachment", "employee_bulk_upload_template.xlsx");

          return ResponseEntity.ok().headers(responseHeaders).body(out.toByteArray());
      }
  }


  @PostMapping("/bulkEmployees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  public ResponseEntity<String> addBulkEmployees(@RequestParam("file") MultipartFile file){
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot process an empty file.");
        }
        try {
            String result = employeeService.bulkAddEmployees(file);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            logger.error("Failed to process bulk employee file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file: " + e.getMessage());
        }
    }

  @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  @Transactional(readOnly = true)
  public List<Employee> all() {
      return empRepo.findAll();
  }

  @GetMapping("/{employeeCode}")
  @Transactional(readOnly = true)
  public ResponseEntity<Employee> fetchByEmployeeCode(@PathVariable String employeeCode){
    return empRepo.findByEmployeeCode(employeeCode)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/by-user-email/{email}")
  @Transactional(readOnly = true)
  public ResponseEntity<Employee> fetchByUserEmail(@PathVariable String email){
    return userRepo.findByEmail(email)
            .flatMap(user -> empRepo.findByUserId(user.getId()))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/by-gender/{gender}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  @Transactional(readOnly = true)
  public ResponseEntity<?> fetchByGender(@PathVariable String gender){
    try {
        Gender genderEnum = Gender.valueOf(gender.toUpperCase());
        List<Employee> employees = empRepo.findByGender(genderEnum);
        return ResponseEntity.ok(employees);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("Invalid gender value: " + gender);
    }
  }

  @GetMapping("/by-martial-status/{martialStatus}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  @Transactional(readOnly = true)
  public ResponseEntity<?> fetchByMartialStatus(@PathVariable String martialStatus){
    try {
        MartialStatus statusEnum = MartialStatus.valueOf(martialStatus.toUpperCase());
        List<Employee> employees = empRepo.findByMartialStatus(statusEnum);
        return ResponseEntity.ok(employees);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("Invalid martial status value: " + martialStatus);
    }
  }

  @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  @Transactional(readOnly = true)
  public ResponseEntity<?> fetchByStatus(@PathVariable String status){
    try {
        EmployeeStatus statusEnum = EmployeeStatus.valueOf(status.toUpperCase());
        List<Employee> employees = empRepo.findByStatus(statusEnum);
        return ResponseEntity.ok(employees);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("Invalid status value: " + status);
    }
  }
  
  @GetMapping("/by-location/{locationId}")
  @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  @Transactional(readOnly = true)
  public ResponseEntity<List<Employee>> fetchByLocation(@PathVariable Long locationId) {
      if (!locationRepository.existsById(locationId)) {
          return ResponseEntity.notFound().build();
      }
      List<Employee> employees = empRepo.findByLocationId(locationId);
      return ResponseEntity.ok(employees);
  }

  @PostMapping("/{employeeCode}/photo")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  public ResponseEntity<?> uploadPhoto(@PathVariable String employeeCode, @RequestParam("file") MultipartFile file) {
      String contentType = file.getContentType();
      if (contentType == null || !contentType.startsWith("image/")) {
          return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body("Invalid file type. Please upload an image (e.g., JPEG, PNG).");
      }

      return empRepo.findByEmployeeCode(employeeCode)
              .map(employee -> {
                  // Optional: Delete old photo if it exists
                  if (employee.getPhotoPath() != null && !employee.getPhotoPath().isEmpty()) {
                      fileStorageService.deleteFile(employee.getPhotoPath());
                  }
                  
                  String fileName = fileStorageService.storeFile(file, employeeCode);
                  employee.setPhotoPath(fileName);
                  
                  String username = SecurityContextHolder.getContext().getAuthentication().getName();
                  employee.setUpdatedBy(username);
                  employee.setUpdatedAt(LocalDateTime.now());
                  
                  Employee updatedEmployee = empRepo.save(employee);
                  return ResponseEntity.ok(updatedEmployee);
              })
              .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/{employeeCode}/photo")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Resource> getPhoto(@PathVariable String employeeCode) {
      return (ResponseEntity<Resource>) empRepo.findByEmployeeCode(employeeCode)
              .map(employee -> {
                  if (employee.getPhotoPath() == null || employee.getPhotoPath().isEmpty()) {
                      return ResponseEntity.notFound().build();
                  }
                  Resource resource = fileStorageService.loadFileAsResource(employee.getPhotoPath());
                  String contentType = "application/octet-stream";
                  try {
                      Path path = resource.getFile().toPath();
                      contentType = java.nio.file.Files.probeContentType(path);
                  } catch (IOException ex) {
                      logger.warn("Could not determine content type for photo: {}", resource.getFilename(), ex);
                  }
                  return ResponseEntity.ok()
                          .contentType(MediaType.parseMediaType(contentType))
                          .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                          .body(resource);
              })
              .orElse(ResponseEntity.notFound().build());
  }

  @PutMapping("/{employeeCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
  public ResponseEntity<Employee> updateEmployee(@PathVariable String employeeCode, @RequestBody EmployeeRequest empRequest){
    return empRepo.findByEmployeeCode(employeeCode)
        .map(employee -> {
            employeeService.updateEmployeeFromRequest(employee, empRequest);
            Employee updatedEmployee = empRepo.save(employee);
            return ResponseEntity.ok(updatedEmployee);
        })
        .orElse(ResponseEntity.notFound().build());
  }

}

package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.entity.*;
import com.example.multi_tanent.crm.enums.*;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.spersusers.enitity.*;
import com.example.multi_tanent.spersusers.repository.CrmIndustryRepository;
import com.example.multi_tanent.spersusers.repository.CrmProductRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx")
public class CrmDummyDataService {

    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;
    private final CrmIndustryRepository industryRepository;
    private final CrmCompanyTypeRepository companyTypeRepository;
    private final CrmProductRepository productRepository;
    private final LeadSourceRepository leadSourceRepository;
    private final CrmLeadStageRepository leadStageRepository;
    private final CrmTaskStageRepository taskStageRepository;
    private final CrmTodoLabelRepository todoLabelRepository;
    private final CrmCompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final CrmLeadRepository leadRepository;
    private final CrmTaskRepository taskRepository;
    private final CrmTodoItemRepository todoItemRepository;
    private final CrmEventRepository eventRepository;
    private final CrmCallLogRepository callLogRepository;
    private final CrmEmailRepository emailRepository;
    private final CrmKpiRepository kpiRepository;
    private final CrmKpiRangeRepository kpiRangeRepository;
    private final CrmKpiEmployeeRepository kpiEmployeeRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = "tenant_1";
        }
        final String searchId = tenantId;
        return tenantRepository.findByTenantId(searchId)
                .orElseGet(() -> tenantRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No Tenant found in system")));
    }

    private <T extends Enum<T>> T parseEnum(Class<T> enumClass, JsonNode node, String fieldName, T fallback) {
        if (node == null || !node.has(fieldName) || node.get(fieldName).isNull()) {
            return fallback;
        }
        String val = node.get(fieldName).asText();
        if (val == null || val.trim().isEmpty() || val.equalsIgnoreCase("null")) {
            return fallback;
        }
        try {
            return Enum.valueOf(enumClass, val.trim());
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }

    public Map<String, Object> seedDummyData() {
        Tenant tenant = getCurrentTenant();
        Long tenantId = tenant.getId();

        List<Employee> employees = employeeRepository.findByUser_Tenant_Id(tenantId);
        if (employees.isEmpty()) {
            employees = employeeRepository.findAll();
        }

        Map<String, Integer> counts = new LinkedHashMap<>();

        try {
            ClassPathResource resource = new ClassPathResource("crm-dummy-data.json");
            InputStream inputStream = resource.getInputStream();
            JsonNode root = objectMapper.readTree(inputStream);

            // 1. Seed Industries
            Map<String, CrmIndustry> industryMap = new HashMap<>();
            JsonNode industriesNode = root.get("industries");
            int indCount = 0;
            if (industriesNode != null && industriesNode.isArray()) {
                for (JsonNode node : industriesNode) {
                    String name = node.asText();
                    if (!industryRepository.existsByTenantIdAndNameIgnoreCase(tenantId, name)) {
                        CrmIndustry ind = CrmIndustry.builder().tenant(tenant).name(name).build();
                        ind = industryRepository.save(ind);
                        indCount++;
                        industryMap.put(name, ind);
                    } else {
                        industryRepository.findByTenantIdOrderByNameAsc(tenantId).stream()
                                .filter(i -> i.getName().equalsIgnoreCase(name))
                                .findFirst().ifPresent(i -> industryMap.put(name, i));
                    }
                }
            }
            counts.put("industries", indCount);

            // 2. Seed Company Types
            Map<String, CompanyType> companyTypeMap = new HashMap<>();
            JsonNode companyTypesNode = root.get("companyTypes");
            int ctCount = 0;
            if (companyTypesNode != null && companyTypesNode.isArray()) {
                for (JsonNode node : companyTypesNode) {
                    String name = node.asText();
                    if (!companyTypeRepository.existsByTenantIdAndNameIgnoreCase(tenantId, name)) {
                        CompanyType ct = CompanyType.builder().tenant(tenant).name(name).build();
                        ct = companyTypeRepository.save(ct);
                        ctCount++;
                        companyTypeMap.put(name, ct);
                    } else {
                        companyTypeRepository.findByTenantIdOrderByNameAsc(tenantId).stream()
                                .filter(c -> c.getName().equalsIgnoreCase(name))
                                .findFirst().ifPresent(c -> companyTypeMap.put(name, c));
                    }
                }
            }
            counts.put("companyTypes", ctCount);

            // 3. Seed Products
            JsonNode productsNode = root.get("products");
            int prodCount = 0;
            if (productsNode != null && productsNode.isArray()) {
                for (JsonNode node : productsNode) {
                    String name = node.get("name").asText();
                    String indName = node.get("industryName").asText();
                    if (!productRepository.existsByTenantIdAndNameIgnoreCase(tenantId, name)) {
                        CrmIndustry ind = industryMap.get(indName);
                        if (ind == null && !industryMap.isEmpty()) {
                            ind = industryMap.values().iterator().next();
                        }
                        if (ind != null) {
                            CrmProduct prod = CrmProduct.builder().tenant(tenant).industry(ind).name(name).build();
                            productRepository.save(prod);
                            prodCount++;
                        }
                    }
                }
            }
            counts.put("products", prodCount);

            // 4. Seed Lead Sources
            Map<String, LeadSource> leadSourceMap = new HashMap<>();
            JsonNode leadSourcesNode = root.get("leadSources");
            int lsCount = 0;
            if (leadSourcesNode != null && leadSourcesNode.isArray()) {
                for (JsonNode node : leadSourcesNode) {
                    String name = node.asText();
                    Optional<LeadSource> existing = leadSourceRepository.findByNameAndTenantId(name, tenantId);
                    if (existing.isEmpty()) {
                        LeadSource ls = LeadSource.builder().tenant(tenant).name(name).build();
                        ls = leadSourceRepository.save(ls);
                        lsCount++;
                        leadSourceMap.put(name, ls);
                    } else {
                        leadSourceMap.put(name, existing.get());
                    }
                }
            }
            counts.put("leadSources", lsCount);

            // 5. Seed Lead Stages
            Map<String, CrmLeadStage> leadStageMap = new HashMap<>();
            JsonNode leadStagesNode = root.get("leadStages");
            int stageCount = 0;
            if (leadStagesNode != null && leadStagesNode.isArray()) {
                for (JsonNode node : leadStagesNode) {
                    String name = node.get("name").asText();
                    if (!leadStageRepository.existsByTenantIdAndNameIgnoreCase(tenantId, name)) {
                        CrmStageMoveTo moveTo = parseEnum(CrmStageMoveTo.class, node, "moveTo", null);
                        CrmLeadStage stage = CrmLeadStage.builder()
                                .tenant(tenant)
                                .name(name)
                                .sortOrder(node.get("sortOrder").asInt())
                                .isDefault(node.get("isDefault").asBoolean())
                                .moveTo(moveTo)
                                .probability(node.get("probability").asDouble())
                                .isConverted(node.get("isConverted").asBoolean())
                                .isWon(node.get("isWon").asBoolean())
                                .isMql(node.get("isMql").asBoolean())
                                .isSql(node.get("isSql").asBoolean())
                                .build();
                        stage = leadStageRepository.save(stage);
                        stageCount++;
                        leadStageMap.put(name, stage);
                    } else {
                        leadStageRepository.findByTenantId(tenantId).stream()
                                .filter(s -> s.getName().equalsIgnoreCase(name))
                                .findFirst().ifPresent(s -> leadStageMap.put(name, s));
                    }
                }
            }
            counts.put("leadStages", stageCount);

            // 6. Seed Task Stages
            JsonNode taskStagesNode = root.get("taskStages");
            int tsCount = 0;
            if (taskStagesNode != null && taskStagesNode.isArray()) {
                for (JsonNode node : taskStagesNode) {
                    String name = node.get("statusName").asText();
                    if (!taskStageRepository.existsByTenantIdAndStatusNameIgnoreCase(tenantId, name)) {
                        CrmTaskStage stage = CrmTaskStage.builder()
                                .tenant(tenant)
                                .statusName(name)
                                .sortOrder(node.get("sortOrder").asInt())
                                .completed(node.get("completed").asBoolean())
                                .isDefault(node.get("isDefault").asBoolean())
                                .build();
                        taskStageRepository.save(stage);
                        tsCount++;
                    }
                }
            }
            counts.put("taskStages", tsCount);

            // 7. Seed Todo Labels
            Map<String, CrmTodoLabel> todoLabelMap = new HashMap<>();
            JsonNode todoLabelsNode = root.get("todoLabels");
            int labelCount = 0;
            List<CrmTodoLabel> existingLabels = todoLabelRepository.findByTenantIdOrderByNameAsc(tenantId);
            existingLabels.forEach(l -> todoLabelMap.put(l.getName(), l));
            if (todoLabelsNode != null && todoLabelsNode.isArray()) {
                for (JsonNode node : todoLabelsNode) {
                    String name = node.get("name").asText();
                    if (!todoLabelMap.containsKey(name)) {
                        CrmTodoLabel label = CrmTodoLabel.builder()
                                .tenant(tenant)
                                .name(name)
                                .colorHex(node.get("colorHex").asText())
                                .starred(node.get("starred").asBoolean())
                                .build();
                        label = todoLabelRepository.save(label);
                        labelCount++;
                        todoLabelMap.put(name, label);
                    }
                }
            }
            counts.put("todoLabels", labelCount);

            // 8. Seed Companies
            Map<String, CrmCompany> companyMap = new HashMap<>();
            JsonNode companiesNode = root.get("companies");
            int compCount = 0;
            if (companiesNode != null && companiesNode.isArray()) {
                for (JsonNode node : companiesNode) {
                    String name = node.get("name").asText();
                    if (!companyRepository.existsByTenantIdAndNameIgnoreCase(tenantId, name)) {
                        CompanyType ct = companyTypeMap.get(node.get("companyTypeName").asText());
                        CrmIndustry ind = industryMap.get(node.get("industryName").asText());
                        CrmCompany comp = CrmCompany.builder()
                                .tenant(tenant)
                                .name(name)
                                .companyType(ct)
                                .industry(ind)
                                .phone(node.get("phone").asText())
                                .email(node.get("email").asText())
                                .website(node.get("website").asText())
                                .companyOwner(node.get("companyOwner").asText())
                                .billingStreet(node.get("billingStreet").asText())
                                .billingCity(node.get("billingCity").asText())
                                .billingState(node.get("billingState").asText())
                                .billingZip(node.get("billingZip").asText())
                                .billingCountry(node.get("billingCountry").asText())
                                .shippingStreet(node.get("shippingStreet").asText())
                                .shippingCity(node.get("shippingCity").asText())
                                .shippingState(node.get("shippingState").asText())
                                .shippingZip(node.get("shippingZip").asText())
                                .shippingCountry(node.get("shippingCountry").asText())
                                .build();
                        comp = companyRepository.save(comp);
                        compCount++;
                        companyMap.put(name, comp);
                    } else {
                        companyRepository.findByNameAndTenantId(name, tenantId)
                                .ifPresent(c -> companyMap.put(name, c));
                    }
                }
            }
            counts.put("companies", compCount);

            // 9. Seed Contacts
            List<Contact> contactList = new ArrayList<>();
            JsonNode contactsNode = root.get("contacts");
            int contactCount = 0;
            if (contactsNode != null && contactsNode.isArray()) {
                for (JsonNode node : contactsNode) {
                    String email = node.get("email").asText();
                    Optional<Contact> existing = contactRepository.findByEmail(email);
                    if (existing.isEmpty()) {
                        Contact c = new Contact();
                        c.setTenant(tenant);
                        c.setFirstName(node.get("firstName").asText());
                        c.setLastName(node.get("lastName").asText());
                        c.setEmail(email);
                        c.setPhone(node.get("phone").asText());
                        c = contactRepository.save(c);
                        contactCount++;
                        contactList.add(c);
                    } else {
                        contactList.add(existing.get());
                    }
                }
            }
            counts.put("contacts", contactCount);

            // 10. Seed Leads
            Map<String, CrmLead> leadMap = new HashMap<>();
            JsonNode leadsNode = root.get("leads");
            int leadCount = 0;
            if (leadsNode != null && leadsNode.isArray()) {
                int idx = 0;
                for (JsonNode node : leadsNode) {
                    String leadNo = node.get("leadNo").asText();
                    if (!leadRepository.existsByTenantIdAndLeadNo(tenantId, leadNo)) {
                        CrmCompany comp = companyMap.get(node.get("companyName").asText());
                        if (comp == null && !companyMap.isEmpty()) {
                            comp = companyMap.values().iterator().next();
                        }
                        CrmIndustry ind = industryMap.get(node.get("industryName").asText());
                        LeadSource ls = leadSourceMap.get(node.get("leadSourceName").asText());
                        CrmLeadStage stage = leadStageMap.get(node.get("stageName").asText());
                        Employee owner = employees.isEmpty() ? null : employees.get(idx % employees.size());

                        Address addrNode = null;
                        if (node.has("address")) {
                            JsonNode a = node.get("address");
                            addrNode = new Address(
                                    a.get("addressLine").asText(),
                                    a.get("city").asText(),
                                    a.get("state").asText(),
                                    a.get("zipCode").asText(),
                                    a.get("country").asText()
                            );
                        }

                        CrmLeadStatus status = parseEnum(CrmLeadStatus.class, node, "status", CrmLeadStatus.NEW);
                        ForecastCategory forecast = parseEnum(ForecastCategory.class, node, "forecastCategory", ForecastCategory.OPEN_PIPELINE);

                        CrmLead lead = CrmLead.builder()
                                .tenant(tenant)
                                .leadNo(leadNo)
                                .firstName(node.get("firstName").asText())
                                .lastName(node.get("lastName").asText())
                                .designation(node.get("designation").asText())
                                .phone(node.get("phone").asText())
                                .email(node.get("email").asText())
                                .website(node.get("website").asText())
                                .company(comp)
                                .industry(ind)
                                .leadSource(ls)
                                .currentStage(stage)
                                .owner(owner)
                                .status(status)
                                .forecastCategory(forecast)
                                .amount(BigDecimal.valueOf(node.get("amount").asDouble()))
                                .requirements(node.get("requirements").asText())
                                .notes(node.get("notes").asText())
                                .address(addrNode)
                                .expectedCloseDate(LocalDate.now().plusDays(node.get("expectedCloseDaysFromNow").asInt()))
                                .build();

                        lead = leadRepository.save(lead);
                        leadCount++;
                        leadMap.put(leadNo, lead);
                    } else {
                        leadRepository.findByTenantIdAndLeadNo(tenantId, leadNo)
                                .ifPresent(l -> leadMap.put(leadNo, l));
                    }
                    idx++;
                }
            }
            counts.put("leads", leadCount);

            // 11. Seed Tasks
            JsonNode tasksNode = root.get("tasks");
            int taskCount = 0;
            if (tasksNode != null && tasksNode.isArray()) {
                int idx = 0;
                for (JsonNode node : tasksNode) {
                    String leadNo = node.get("leadNo").asText();
                    CrmLead lead = leadMap.get(leadNo);
                    Employee emp = employees.isEmpty() ? null : employees.get(idx % employees.size());
                    TaskSubject subject = parseEnum(TaskSubject.class, node, "subject", TaskSubject.TASK);

                    CrmTask task = CrmTask.builder()
                            .tenant(tenant)
                            .lead(lead)
                            .assignedTo(emp)
                            .subject(subject)
                            .comments(node.get("comments").asText())
                            .status(node.get("status").asText())
                            .dueDate(LocalDate.now().plusDays(node.get("dueDaysFromNow").asInt()))
                            .callTime(LocalTime.parse(node.get("callTime").asText()))
                            .build();

                    taskRepository.save(task);
                    taskCount++;
                    idx++;
                }
            }
            counts.put("tasks", taskCount);

            // 12. Seed Todos
            JsonNode todosNode = root.get("todos");
            int todoCount = 0;
            if (todosNode != null && todosNode.isArray()) {
                int idx = 0;
                for (JsonNode node : todosNode) {
                    String leadNo = node.get("leadNo").asText();
                    CrmLead lead = leadMap.get(leadNo);
                    Employee emp = employees.isEmpty() ? null : employees.get(idx % employees.size());
                    CrmTodoLabel label = todoLabelMap.get(node.get("labelName").asText());

                    Set<CrmTodoLabel> labelSet = new LinkedHashSet<>();
                    if (label != null) labelSet.add(label);

                    TaskSubject subject = parseEnum(TaskSubject.class, node, "subject", TaskSubject.TASK);
                    TodoStatus status = parseEnum(TodoStatus.class, node, "status", TodoStatus.OPEN);
                    TodoPriority priority = parseEnum(TodoPriority.class, node, "priority", TodoPriority.NORMAL);

                    CrmTodoItem todo = CrmTodoItem.builder()
                            .tenant(tenant)
                            .lead(lead)
                            .assignedTo(emp)
                            .subject(subject)
                            .description(node.get("description").asText())
                            .status(status)
                            .priority(priority)
                            .customerContactName(node.get("customerContactName").asText())
                            .labels(labelSet)
                            .dueDate(LocalDate.now().plusDays(node.get("dueDaysFromNow").asInt()))
                            .fromTime(LocalTime.parse(node.get("fromTime").asText()))
                            .toTime(LocalTime.parse(node.get("toTime").asText()))
                            .build();

                    todoItemRepository.save(todo);
                    todoCount++;
                    idx++;
                }
            }
            counts.put("todos", todoCount);

            // 13. Seed Events
            JsonNode eventsNode = root.get("events");
            int eventCount = 0;
            if (eventsNode != null && eventsNode.isArray()) {
                int idx = 0;
                for (JsonNode node : eventsNode) {
                    String leadNo = node.get("leadNo").asText();
                    CrmLead lead = leadMap.get(leadNo);
                    Contact contact = contactList.isEmpty() ? null : contactList.get(idx % contactList.size());

                    EventSubject subject = parseEnum(EventSubject.class, node, "subject", EventSubject.EVENT);
                    EventStatus status = parseEnum(EventStatus.class, node, "status", EventStatus.OPEN);
                    EventPriority priority = parseEnum(EventPriority.class, node, "priority", EventPriority.NORMAL);
                    MeetingType meetingType = parseEnum(MeetingType.class, node, "meetingType", MeetingType.ONLINE);

                    CrmEvent event = CrmEvent.builder()
                            .tenant(tenant)
                            .lead(lead)
                            .primaryContact(contact)
                            .subject(subject)
                            .description(node.get("description").asText())
                            .status(status)
                            .priority(priority)
                            .meetingType(meetingType)
                            .meetingWith(node.get("meetingWith").asText())
                            .sameStartEnd(node.get("sameStartEnd").asBoolean())
                            .date(LocalDate.now().plusDays(node.get("eventDaysFromNow").asInt()))
                            .fromTime(LocalTime.parse(node.get("fromTime").asText()))
                            .toTime(LocalTime.parse(node.get("toTime").asText()))
                            .build();

                    eventRepository.save(event);
                    eventCount++;
                    idx++;
                }
            }
            counts.put("events", eventCount);

            // 14. Seed Call Logs
            JsonNode callLogsNode = root.get("callLogs");
            int callLogCount = 0;
            if (callLogsNode != null && callLogsNode.isArray()) {
                int idx = 0;
                for (JsonNode node : callLogsNode) {
                    String leadNo = node.get("leadNo").asText();
                    CrmLead lead = leadMap.get(leadNo);
                    Employee emp = employees.isEmpty() ? null : employees.get(idx % employees.size());
                    Contact contact = contactList.isEmpty() ? null : contactList.get(idx % contactList.size());

                    CrmCallLog callLog = CrmCallLog.builder()
                            .tenant(tenant)
                            .lead(lead)
                            .employee(emp)
                            .contact(contact)
                            .comments(node.get("comments").asText())
                            .callDate(LocalDate.now().plusDays(node.get("callDaysFromNow").asInt()))
                            .callTime(LocalTime.parse(node.get("callTime").asText()))
                            .remindMeBefore(node.get("remindMeBefore").asBoolean())
                            .reminderTime(LocalTime.parse(node.get("reminderTime").asText()))
                            .build();

                    callLogRepository.save(callLog);
                    callLogCount++;
                    idx++;
                }
            }
            counts.put("callLogs", callLogCount);

            // 15. Seed Emails
            JsonNode emailsNode = root.get("emails");
            int emailCount = 0;
            if (emailsNode != null && emailsNode.isArray()) {
                int idx = 0;
                for (JsonNode node : emailsNode) {
                    String leadNo = node.get("leadNo").asText();
                    CrmLead lead = leadMap.get(leadNo);
                    Employee emp = employees.isEmpty() ? null : employees.get(idx % employees.size());
                    Contact contact = contactList.isEmpty() ? null : contactList.get(idx % contactList.size());
                    EmailStatus status = parseEnum(EmailStatus.class, node, "status", EmailStatus.SENT);

                    CrmEmail email = CrmEmail.builder()
                            .tenant(tenant)
                            .lead(lead)
                            .contact(contact)
                            .sentBy(emp)
                            .fromAddress(node.get("fromAddress").asText())
                            .toAddress(node.get("toAddress").asText())
                            .ccAddress(node.get("ccAddress").asText())
                            .subject(node.get("subject").asText())
                            .body(node.get("body").asText())
                            .status(status)
                            .build();

                    emailRepository.save(email);
                    emailCount++;
                    idx++;
                }
            }
            counts.put("emails", emailCount);

            // 16. Seed KPIs
            try {
                jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN from_percent DOUBLE");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN to_percent DOUBLE");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN color VARCHAR(50)");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN location_id BIGINT NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges MODIFY COLUMN min_value DECIMAL(19,2) NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges MODIFY COLUMN max_value DECIMAL(19,2) NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS crm_todo_labels_link (todo_id BIGINT NOT NULL, label_id BIGINT NOT NULL, PRIMARY KEY (todo_id, label_id))");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS crm_todo_employees (todo_id BIGINT NOT NULL, employee_id BIGINT NOT NULL, PRIMARY KEY (todo_id, employee_id))");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS crm_todo_contacts (todo_id BIGINT NOT NULL, contact_id BIGINT NOT NULL, PRIMARY KEY (todo_id, contact_id))");
            } catch (Exception ignored) {}

            JsonNode kpisNode = root.get("kpis");
            int kpiCount = 0;
            if (kpisNode != null && kpisNode.isArray()) {
                for (JsonNode node : kpisNode) {
                    String name = node.get("name").asText();
                    if (!kpiRepository.existsByTenantIdAndNameIgnoreCase(tenantId, name)) {
                        KpidataType dataType = parseEnum(KpidataType.class, node, "dataType", KpidataType.NUMBER);
                        KpiType type = parseEnum(KpiType.class, node, "type", KpiType.MONTHLY);

                        CrmKpi kpi = new CrmKpi();
                        kpi.setTenant(tenant);
                        kpi.setName(name);
                        kpi.setDescription(node.get("description").asText());
                        kpi.setDataType(dataType);
                        kpi.setType(type);
                        kpi = kpiRepository.save(kpi);

                        JsonNode rangesNode = node.get("ranges");
                        if (rangesNode != null && rangesNode.isArray()) {
                            for (JsonNode rNode : rangesNode) {
                                CrmKpiRange range = new CrmKpiRange();
                                range.setKpi(kpi);
                                range.setFromPercent(rNode.get("fromPercent").asDouble());
                                range.setToPercent(rNode.get("toPercent").asDouble());
                                range.setColor(rNode.get("color").asText());
                                kpiRangeRepository.save(range);
                            }
                        }

                        if (!employees.isEmpty()) {
                            for (Employee emp : employees) {
                                CrmKpiEmployee kpiEmp = new CrmKpiEmployee();
                                kpiEmp.setKpi(kpi);
                                kpiEmp.setEmployee(emp);
                                kpiEmp.setTargetValue(BigDecimal.valueOf(100.00));
                                kpiEmployeeRepository.save(kpiEmp);
                            }
                        }
                        kpiCount++;
                    }
                }
            }
            counts.put("kpis", kpiCount);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("message", "Dummy data insertion process completed for tenant: " + tenant.getName());
            result.put("counts", counts);
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to seed dummy data: " + e.getMessage(), e);
        }
    }
}

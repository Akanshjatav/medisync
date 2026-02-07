package com.tcs.ilp.pharmacy.medisync.bootstrap;

import com.tcs.ilp.pharmacy.medisync.entity.*;
import com.tcs.ilp.pharmacy.medisync.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
public class HeavyDataBootstrap implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final UsersRepository usersRepo;
    private final StoreRepository storeRepo;
    private final InventoryRepository inventoryRepo;
    private final VendorRepository vendorRepo;
    private final RfqRepository rfqRepo;
    private final BidsRepository bidsRepo;
    private final BatchRepository batchRepo;
    private final ProductRepository productRepo;
    private final StockRequestsRepository stockReqRepo;
    private final StockTransfersRepository stockTransferRepo;
    private final NotificationRepository notificationRepo;

    public HeavyDataBootstrap(
            RoleRepository roleRepo,
            UsersRepository usersRepo,
            StoreRepository storeRepo,
            InventoryRepository inventoryRepo,
            VendorRepository vendorRepo,
            RfqRepository rfqRepo,
            BidsRepository bidsRepo,
            BatchRepository batchRepo,
            ProductRepository productRepo,
            StockRequestsRepository stockReqRepo,
            StockTransfersRepository stockTransferRepo,
            NotificationRepository notificationRepo
    ) {
        this.roleRepo = roleRepo;
        this.usersRepo = usersRepo;
        this.storeRepo = storeRepo;
        this.inventoryRepo = inventoryRepo;
        this.vendorRepo = vendorRepo;
        this.rfqRepo = rfqRepo;
        this.bidsRepo = bidsRepo;
        this.batchRepo = batchRepo;
        this.productRepo = productRepo;
        this.stockReqRepo = stockReqRepo;
        this.stockTransferRepo = stockTransferRepo;
        this.notificationRepo = notificationRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {

        // Avoid reseeding
        if (usersRepo.count() > 0) return;

        // =====================================================
        // ROLES
        // =====================================================
        Role admin = roleRepo.save(role("ADMIN"));
        Role manager = roleRepo.save(role("MANAGER"));
        Role pharmacist = roleRepo.save(role("PHARMACIST"));
        roleRepo.save(role("VENDOR"));

        // =====================================================
        // ADMIN
        // =====================================================
        Users hoAdmin = usersRepo.save(user("HO Admin", "admin@ho.com", admin));

        // =====================================================
        // STORES + USERS (more)
        // =====================================================
        Users mgrBlr = usersRepo.save(user("Manager BLR", "mgr.blr@store.com", manager));
        Users pharmBlr = usersRepo.save(user("Pharmacist BLR", "pharm.blr@store.com", pharmacist));
        Stores blr = storeRepo.save(store("Bangalore Central", "Bangalore", mgrBlr, pharmBlr));
        Inventory invBlr = inventoryRepo.save(inventory(blr));

        Users mgrDel = usersRepo.save(user("Manager DEL", "mgr.del@store.com", manager));
        Users pharmDel = usersRepo.save(user("Pharmacist DEL", "pharm.del@store.com", pharmacist));
        Stores del = storeRepo.save(store("Delhi North", "Delhi", mgrDel, pharmDel));
        Inventory invDel = inventoryRepo.save(inventory(del));

        Users mgrHyd = usersRepo.save(user("Manager HYD", "mgr.hyd@store.com", manager));
        Users pharmHyd = usersRepo.save(user("Pharmacist HYD", "pharm.hyd@store.com", pharmacist));
        Stores hyd = storeRepo.save(store("Hyderabad East", "Hyderabad", mgrHyd, pharmHyd));
        Inventory invHyd = inventoryRepo.save(inventory(hyd));

        Users mgrMum = usersRepo.save(user("Manager MUM", "mgr.mum@store.com", manager));
        Users pharmMum = usersRepo.save(user("Pharmacist MUM", "pharm.mum@store.com", pharmacist));
        Stores mum = storeRepo.save(store("Mumbai West", "Mumbai", mgrMum, pharmMum));
        Inventory invMum = inventoryRepo.save(inventory(mum));

        Users mgrChe = usersRepo.save(user("Manager CHE", "mgr.che@store.com", manager));
        Users pharmChe = usersRepo.save(user("Pharmacist CHE", "pharm.che@store.com", pharmacist));
        Stores che = storeRepo.save(store("Chennai South", "Chennai", mgrChe, pharmChe));
        Inventory invChe = inventoryRepo.save(inventory(che));

        // =====================================================
        // VENDORS (>= 6; using 8)
        // =====================================================
        Vendor vendorA = vendorRepo.save(vendor(hoAdmin, "vendorA@biz.com", "GST-A", "LIC-A"));
        Vendor vendorB = vendorRepo.save(vendor(hoAdmin, "vendorB@biz.com", "GST-B", "LIC-B"));
        Vendor vendorC = vendorRepo.save(vendor(hoAdmin, "vendorC@biz.com", "GST-C", "LIC-C"));
        Vendor vendorD = vendorRepo.save(vendor(hoAdmin, "vendorD@biz.com", "GST-D", "LIC-D"));
        Vendor vendorE = vendorRepo.save(vendor(hoAdmin, "vendorE@biz.com", "GST-E", "LIC-E"));
        Vendor vendorF = vendorRepo.save(vendor(hoAdmin, "vendorF@biz.com", "GST-F", "LIC-F"));
        Vendor vendorG = vendorRepo.save(vendor(hoAdmin, "vendorG@biz.com", "GST-G", "LIC-G"));
        Vendor vendorH = vendorRepo.save(vendor(hoAdmin, "vendorH@biz.com", "GST-H", "LIC-H"));

        // =====================================================
        // RFQs (more + deadlines/delivery dates)
        // =====================================================
        Rfq rfqBlr = rfqRepo.save(rfqWithMeta(
                blr, mgrBlr, "ISSUED",
                LocalDateTime.now().plusDays(3),
                LocalDateTime.now().plusDays(8),
                "Deliver in sealed cartons. Include COA where applicable.",
                rfqItem("Paracetamol", 1500),
                rfqItem("Ibuprofen", 1200),
                rfqItem("Cetirizine", 800)
        ));

        Rfq rfqDel = rfqRepo.save(rfqWithMeta(
                del, mgrDel, "ISSUED",
                LocalDateTime.now().plusDays(2),
                LocalDateTime.now().plusDays(7),
                "Temperature controlled transport for antibiotics.",
                rfqItem("Amoxicillin", 900),
                rfqItem("Azithromycin", 700),
                rfqItem("Pantoprazole", 600)
        ));

        Rfq rfqHyd = rfqRepo.save(rfqWithMeta(
                hyd, mgrHyd, "ISSUED",
                LocalDateTime.now().plusDays(4),
                LocalDateTime.now().plusDays(10),
                "Prefer longer expiry. Provide batch-wise details.",
                rfqItem("Metformin", 1200),
                rfqItem("Amlodipine", 800),
                rfqItem("Atorvastatin", 750)
        ));

        Rfq rfqMum = rfqRepo.save(rfqWithMeta(
                mum, mgrMum, "ISSUED",
                LocalDateTime.now().plusDays(3),
                LocalDateTime.now().plusDays(9),
                "Strict cold chain for insulin.",
                rfqItem("Insulin", 250),
                rfqItem("Glucometer Strips", 2500),
                rfqItem("Vitamin D3", 900)
        ));

        Rfq rfqChe = rfqRepo.save(rfqWithMeta(
                che, mgrChe, "ISSUED",
                LocalDateTime.now().plusDays(2),
                LocalDateTime.now().plusDays(6),
                "Asthma range priority; deliver ASAP.",
                rfqItem("Salbutamol Inhaler", 350),
                rfqItem("Montelukast", 650),
                rfqItem("Levocetirizine", 750)
        ));

        // =====================================================
        // BIDS (3 bids per RFQ) + AWARD one
        // =====================================================

        // --- BLR ---
        Bids blrBidA = bidsRepo.save(bid(rfqBlr, vendorA, "SUBMITTED",
                bidItem("Paracetamol", 1500, 2.15),
                bidItem("Ibuprofen", 1200, 3.10),
                bidItem("Cetirizine", 800, 1.30)
        ));
        Bids blrBidB = bidsRepo.save(bid(rfqBlr, vendorB, "SUBMITTED",
                bidItem("Paracetamol", 1500, 2.05),
                bidItem("Ibuprofen", 1200, 2.95),
                bidItem("Cetirizine", 800, 1.25)
        ));
        Bids blrBidE = bidsRepo.save(bid(rfqBlr, vendorE, "SUBMITTED",
                bidItem("Paracetamol", 1500, 2.18),
                bidItem("Ibuprofen", 1200, 3.05),
                bidItem("Cetirizine", 800, 1.28)
        ));
        awardRfq(rfqBlr, blrBidB, List.of(blrBidA, blrBidB, blrBidE));

        // --- DEL ---
        Bids delBidC = bidsRepo.save(bid(rfqDel, vendorC, "SUBMITTED",
                bidItem("Amoxicillin", 900, 4.35),
                bidItem("Azithromycin", 700, 5.80),
                bidItem("Pantoprazole", 600, 1.90)
        ));
        Bids delBidD = bidsRepo.save(bid(rfqDel, vendorD, "SUBMITTED",
                bidItem("Amoxicillin", 900, 4.55),
                bidItem("Azithromycin", 700, 5.95),
                bidItem("Pantoprazole", 600, 2.05)
        ));
        Bids delBidF = bidsRepo.save(bid(rfqDel, vendorF, "SUBMITTED",
                bidItem("Amoxicillin", 900, 4.40),
                bidItem("Azithromycin", 700, 5.85),
                bidItem("Pantoprazole", 600, 1.98)
        ));
        awardRfq(rfqDel, delBidC, List.of(delBidC, delBidD, delBidF));

        // --- HYD ---
        Bids hydBidF = bidsRepo.save(bid(rfqHyd, vendorF, "SUBMITTED",
                bidItem("Metformin", 1200, 1.10),
                bidItem("Amlodipine", 800, 1.55),
                bidItem("Atorvastatin", 750, 2.20)
        ));
        Bids hydBidA = bidsRepo.save(bid(rfqHyd, vendorA, "SUBMITTED",
                bidItem("Metformin", 1200, 1.18),
                bidItem("Amlodipine", 800, 1.60),
                bidItem("Atorvastatin", 750, 2.25)
        ));
        Bids hydBidH = bidsRepo.save(bid(rfqHyd, vendorH, "SUBMITTED",
                bidItem("Metformin", 1200, 1.15),
                bidItem("Amlodipine", 800, 1.58),
                bidItem("Atorvastatin", 750, 2.22)
        ));
        awardRfq(rfqHyd, hydBidF, List.of(hydBidF, hydBidA, hydBidH));

        // --- MUM ---
        Bids mumBidG = bidsRepo.save(bid(rfqMum, vendorG, "SUBMITTED",
                bidItem("Insulin", 250, 320.00),
                bidItem("Glucometer Strips", 2500, 18.50),
                bidItem("Vitamin D3", 900, 9.50)
        ));
        Bids mumBidH = bidsRepo.save(bid(rfqMum, vendorH, "SUBMITTED",
                bidItem("Insulin", 250, 335.00),
                bidItem("Glucometer Strips", 2500, 19.20),
                bidItem("Vitamin D3", 900, 9.90)
        ));
        Bids mumBidB = bidsRepo.save(bid(rfqMum, vendorB, "SUBMITTED",
                bidItem("Insulin", 250, 328.00),
                bidItem("Glucometer Strips", 2500, 18.90),
                bidItem("Vitamin D3", 900, 9.70)
        ));
        awardRfq(rfqMum, mumBidG, List.of(mumBidG, mumBidH, mumBidB));

        // --- CHE ---
        Bids cheBidE = bidsRepo.save(bid(rfqChe, vendorE, "SUBMITTED",
                bidItem("Salbutamol Inhaler", 350, 89.00),
                bidItem("Montelukast", 650, 2.65),
                bidItem("Levocetirizine", 750, 1.35)
        ));
        Bids cheBidB = bidsRepo.save(bid(rfqChe, vendorB, "SUBMITTED",
                bidItem("Salbutamol Inhaler", 350, 95.00),
                bidItem("Montelukast", 650, 2.80),
                bidItem("Levocetirizine", 750, 1.45)
        ));
        Bids cheBidD = bidsRepo.save(bid(rfqChe, vendorD, "SUBMITTED",
                bidItem("Salbutamol Inhaler", 350, 92.00),
                bidItem("Montelukast", 650, 2.72),
                bidItem("Levocetirizine", 750, 1.40)
        ));
        awardRfq(rfqChe, cheBidE, List.of(cheBidE, cheBidB, cheBidD));

        // =====================================================
        // BATCHES + PRODUCTS (tie to awarded vendors so FE shows realistic flow)
        // =====================================================
        Batch batchBlr = batchRepo.save(batch(invBlr, rfqBlr.getAwardedVendor(), "BLR-B-001"));
        Batch batchDel = batchRepo.save(batch(invDel, rfqDel.getAwardedVendor(), "DEL-B-001"));
        Batch batchHyd = batchRepo.save(batch(invHyd, rfqHyd.getAwardedVendor(), "HYD-B-001"));
        Batch batchMum = batchRepo.save(batch(invMum, rfqMum.getAwardedVendor(), "MUM-B-001"));
        Batch batchChe = batchRepo.save(batch(invChe, rfqChe.getAwardedVendor(), "CHE-B-001"));

        productRepo.saveAll(List.of(
                product(batchBlr, "Paracetamol", "Tablet", 1500, 2.05),
                product(batchBlr, "Ibuprofen", "Tablet", 1200, 2.95),
                product(batchBlr, "Cetirizine", "Tablet", 800, 1.25),

                product(batchDel, "Amoxicillin", "Capsule", 900, 4.35),
                product(batchDel, "Azithromycin", "Tablet", 700, 5.80),
                product(batchDel, "Pantoprazole", "Tablet", 600, 1.90),

                product(batchHyd, "Metformin", "Tablet", 1200, 1.10),
                product(batchHyd, "Amlodipine", "Tablet", 800, 1.55),
                product(batchHyd, "Atorvastatin", "Tablet", 750, 2.20),

                product(batchMum, "Insulin", "Injection", 250, 320.00),
                product(batchMum, "Glucometer Strips", "Device", 2500, 18.50),
                product(batchMum, "Vitamin D3", "Capsule", 900, 9.50),

                product(batchChe, "Salbutamol Inhaler", "Inhaler", 350, 89.00),
                product(batchChe, "Montelukast", "Tablet", 650, 2.65),
                product(batchChe, "Levocetirizine", "Tablet", 750, 1.35)
        ));

        // =====================================================
        // STOCK REQUESTS (more)
        // =====================================================
        stockReqRepo.save(stockRequest(blr, pharmBlr,
                stockReqItem("Paracetamol", 200),
                stockReqItem("Ibuprofen", 150)
        ));

        stockReqRepo.save(stockRequest(del, pharmDel,
                stockReqItem("Azithromycin", 120),
                stockReqItem("Pantoprazole", 180)
        ));

        stockReqRepo.save(stockRequest(mum, pharmMum,
                stockReqItem("Vitamin D3", 120),
                stockReqItem("Glucometer Strips", 600)
        ));

        // =====================================================
        // NOTIFICATIONS (more)
        // =====================================================
        notificationRepo.save(notification(
                pharmBlr, hoAdmin, "HIGH",
                "RFQ Awarded", "BLR RFQ awarded to " + rfqBlr.getAwardedVendor().getVendorName()
        ));
        notificationRepo.save(notification(
                pharmDel, hoAdmin, "MEDIUM",
                "Expiry Alert", "Azithromycin nearing expiry at DEL"
        ));
        notificationRepo.save(notification(
                pharmMum, hoAdmin, "LOW",
                "New Stock Arrived", "Insulin shipment expected for MUM"
        ));
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private Role role(String name) {
        Role r = new Role();
        r.setRoleName(name);
        return r;
    }

    private Users user(String name, String email, Role role) {
        Users u = new Users();
        u.setName(name);
        u.setEmail(email);
        u.setUsername(email);
        u.setPassword("password");
        u.setRole(role);
        u.setActive(true);
        return u;
    }

    private Stores store(String name, String loc, Users mgr, Users pharm) {
        Stores s = new Stores();
        s.setStoreName(name);
        s.setLocation(loc);
        s.setAddress(loc + " main road");
        s.setManager(mgr);
        s.setPharmacist(pharm);
        return s;
    }

    private Inventory inventory(Stores store) {
        Inventory i = new Inventory();
        i.setStore(store);
        return i;
    }

    private Vendor vendor(Users accountManager, String email, String gst, String lic) {
        Vendor v = new Vendor();
        v.setUser(null);
        v.setEmail(email);
        v.setPassword("password");
        v.setGstNumber(gst);
        v.setLicenseNumber(lic);
        v.setAddress("Vendor HQ");
        v.setStatus("APPROVED");
        v.setVendorName(email.split("@")[0]); // NOT NULL
        return v;
    }

    private Rfq rfqWithMeta(Stores store, Users by, String status,
                            LocalDateTime deadline, LocalDateTime delivery,
                            String instructions,
                            RfqItems... items) {
        Rfq r = new Rfq();
        r.setStore(store);
        r.setCreatedBy(by);
        r.setStatus(status);
        r.setSubmissionDeadline(deadline);
        r.setExpectedDeliveryDate(delivery);
        r.setSpecialInstructions(instructions);
        for (RfqItems i : items) r.getItems().add(i);
        return r;
    }

    private RfqItems rfqItem(String med, int qty) {
        RfqItems i = new RfqItems();
        i.setMedicineName(med);
        i.setQuantityNeeded(qty);
        return i;
    }

    private Bids bid(Rfq rfq, Vendor vendor, String status, BidItems... items) {
        Bids b = new Bids();
        b.setRfq(rfq);
        b.setVendor(vendor);
        b.setStatus(status);
        for (BidItems i : items) {
            i.setBids(b);
            b.getItems().add(i);
        }
        return b;
    }

    private BidItems bidItem(String med, int qty, double price) {
        BidItems i = new BidItems();
        i.setMedicineName(med);
        i.setItemQuantity(qty);
        i.setItemPrice(BigDecimal.valueOf(price));
        return i;
    }

    /**
     * Awards an RFQ to the winning bid:
     * - RFQ: status=AWARDED + awardedVendor + awardedBid
     * - Winner bid: ACCEPTED
     * - Other bids: REJECTED
     */
    private void awardRfq(Rfq rfq, Bids winningBid, List<Bids> allBidsForRfq) {
        for (Bids b : allBidsForRfq) {
            if (b.getBidId().equals(winningBid.getBidId())) {
                b.setStatus("ACCEPTED");
            } else {
                b.setStatus("REJECTED");
            }
            bidsRepo.save(b);
        }

        rfq.setStatus("AWARDED");
        rfq.setAwardedVendor(winningBid.getVendor());
        rfq.setAwardedBid(winningBid);
        rfqRepo.save(rfq);
    }

    private Batch batch(Inventory inv, Vendor vendor, String code) {
        Batch b = new Batch();
        b.setInventory(inv);
        b.setVendor(vendor);
        b.setBatchCode(code);
        b.setDeliveryDate(LocalDate.now());
        return b;
    }

    private Product product(Batch b, String name, String cat, int qty, double price) {
        Product p = new Product();
        p.setBatch(b);
        p.setProductName(name);
        p.setCategory(cat);
        p.setQuantityTotal(qty);
        p.setPrice(price);
        p.setExpiryDate(LocalDate.now().plusYears(2));
        return p;
    }

    private StockRequests stockRequest(Stores s, Users u, StockRequestItems... items) {
        StockRequests sr = new StockRequests();
        sr.setStore(s);
        sr.setRequestedBy(u);
        sr.setStatus("PENDING");
        for (StockRequestItems i : items) {
            i.setStockRequestId(sr);
            sr.getItems().add(i);
        }
        return sr;
    }

    private StockRequestItems stockReqItem(String med, int qty) {
        StockRequestItems i = new StockRequestItems();
        i.setMedicineName(med);
        i.setRequiredQuantity(qty);
        return i;
    }

    private Notification notification(Users from, Users to, String sev, String title, String msg) {
        Notification n = new Notification();
        n.setRaisedBy(from);
        n.setToUser(to);
        n.setSeverity(sev);
        n.setTitle(title);
        n.setMessage(msg);
        n.setNotificationStatus("NEW");
        return n;
    }
}

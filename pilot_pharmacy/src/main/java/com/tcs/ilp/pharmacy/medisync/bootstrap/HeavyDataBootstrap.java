package com.tcs.ilp.pharmacy.medisync.bootstrap;

import com.tcs.ilp.pharmacy.medisync.entity.*;
import com.tcs.ilp.pharmacy.medisync.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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

        if (usersRepo.count() > 0) return;

        // =====================================================
        // ROLES
        // =====================================================
        Role admin = roleRepo.save(role("ADMIN"));
        Role manager = roleRepo.save(role("MANAGER"));
        Role pharmacist = roleRepo.save(role("PHARMACIST"));
        Role vendorRole = roleRepo.save(role("VENDOR"));

        // =====================================================
        // ADMIN
        // =====================================================
        Users hoAdmin = usersRepo.save(user("HO Admin", "admin@ho.com", admin));

        // =====================================================
        // MANAGERS & PHARMACISTS
        // =====================================================
        Users mgrBlr = usersRepo.save(user("Manager BLR", "mgr.blr@store.com", manager));
        Users pharmBlr = usersRepo.save(user("Pharmacist BLR", "pharm.blr@store.com", pharmacist));

        Users mgrDel = usersRepo.save(user("Manager DEL", "mgr.del@store.com", manager));
        Users pharmDel = usersRepo.save(user("Pharmacist DEL", "pharm.del@store.com", pharmacist));

        Users mgrHyd = usersRepo.save(user("Manager HYD", "mgr.hyd@store.com", manager));
        Users pharmHyd = usersRepo.save(user("Pharmacist HYD", "pharm.hyd@store.com", pharmacist));

        // =====================================================
        // STORES
        // =====================================================
        Stores blr = storeRepo.save(store("Bangalore Central", "Bangalore", mgrBlr, pharmBlr));
        Stores del = storeRepo.save(store("Delhi North", "Delhi", mgrDel, pharmDel));
        Stores hyd = storeRepo.save(store("Hyderabad East", "Hyderabad", mgrHyd, pharmHyd));

        // =====================================================
        // INVENTORIES
        // =====================================================
        Inventory invBlr = inventoryRepo.save(inventory(blr));
        Inventory invDel = inventoryRepo.save(inventory(del));
        Inventory invHyd = inventoryRepo.save(inventory(hyd));

        // =====================================================
        // VENDORS (LINKED TO ADMIN)
        // =====================================================
        Vendor vendorA = vendorRepo.save(vendor(hoAdmin, "vendorA@biz.com", "GST-A", "LIC-A"));
        Vendor vendorB = vendorRepo.save(vendor(hoAdmin, "vendorB@biz.com", "GST-B", "LIC-B"));
        Vendor vendorC = vendorRepo.save(vendor(hoAdmin, "vendorC@biz.com", "GST-C", "LIC-C"));
        Vendor vendorD = vendorRepo.save(vendor(hoAdmin, "vendorD@biz.com", "GST-D", "LIC-D"));

        // =====================================================
        // RFQs (multiple stores)
        // =====================================================
        Rfq rfqBlr = rfqRepo.save(rfq(
                blr, mgrBlr, "ISSUED",
                rfqItem("Paracetamol", 1000),
                rfqItem("Ibuprofen", 800),
                rfqItem("Cetirizine", 600)
        ));

        Rfq rfqDel = rfqRepo.save(rfq(
                del, mgrDel, "ISSUED",
                rfqItem("Amoxicillin", 500),
                rfqItem("Azithromycin", 300)
        ));

        // =====================================================
        // BIDS
        // =====================================================
        bidsRepo.save(bid(rfqBlr, vendorA,
                bidItem("Paracetamol", 1000, 2.10),
                bidItem("Ibuprofen", 800, 3.00)
        ));

        bidsRepo.save(bid(rfqBlr, vendorB,
                bidItem("Paracetamol", 1000, 2.00),
                bidItem("Ibuprofen", 800, 2.90)
        ));

        bidsRepo.save(bid(rfqDel, vendorC,
                bidItem("Amoxicillin", 500, 4.50),
                bidItem("Azithromycin", 300, 6.00)
        ));

        // =====================================================
        // BATCHES + PRODUCTS
        // =====================================================
        Batch batchBlr = batchRepo.save(batch(invBlr, vendorB, "BLR-B-001"));
        Batch batchDel = batchRepo.save(batch(invDel, vendorC, "DEL-B-001"));
        Batch batchHyd = batchRepo.save(batch(invHyd, vendorD, "HYD-B-001"));

        productRepo.saveAll(List.of(
                product(batchBlr, "Paracetamol", "Tablet", 1000, 2.0),
                product(batchBlr, "Ibuprofen", "Tablet", 800, 2.9),

                product(batchDel, "Amoxicillin", "Capsule", 500, 4.5),
                product(batchDel, "Azithromycin", "Tablet", 300, 6.0),

                product(batchHyd, "Cetirizine", "Tablet", 600, 1.2)
        ));

        // =====================================================
        // STOCK REQUESTS
        // =====================================================
        stockReqRepo.save(stockRequest(blr, pharmBlr,
                stockReqItem("Paracetamol", 200),
                stockReqItem("Ibuprofen", 100)
        ));

        stockReqRepo.save(stockRequest(del, pharmDel,
                stockReqItem("Amoxicillin", 150)
        ));

        // =====================================================
        // NOTIFICATIONS
        // =====================================================
        notificationRepo.save(notification(
                pharmBlr,
                hoAdmin,
                "HIGH",
                "Low Stock",
                "Paracetamol below threshold at BLR"
        ));

        notificationRepo.save(notification(
                pharmDel,
                hoAdmin,
                "MEDIUM",
                "Expiry Alert",
                "Azithromycin nearing expiry at DEL"
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
        v.setUser(accountManager); // business link ONLY
        v.setEmail(email);
        v.setPassword("password");
        v.setGstNumber(gst);
        v.setLicenseNumber(lic);
        v.setAddress("Vendor HQ");
        v.setStatus("APPROVED");
        return v;
    }

    private Rfq rfq(Stores store, Users by, String status, RfqItems... items) {
        Rfq r = new Rfq();
        r.setStore(store);
        r.setCreatedBy(by);
        r.setStatus(status);
        for (RfqItems i : items) r.getItems().add(i);
        return r;
    }

    private RfqItems rfqItem(String med, int qty) {
        RfqItems i = new RfqItems();
        i.setMedicineName(med);
        i.setQuantityNeeded(qty);
        return i;
    }

    private Bids bid(Rfq rfq, Vendor vendor, BidItems... items) {
        Bids b = new Bids();
        b.setRfq(rfq);
        b.setVendor(vendor);
        b.setStatus("SUBMITTED");
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

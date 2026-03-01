require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from your known frontend URLs and Vercel previews
        const allowedOrigins = [
            'https://ecom-frontend-lyart-nine.vercel.app',
            'https://ecom-frontend-1s95oo36v-cap-231s-projects.vercel.app',
            'http://localhost:3000',
            'http://localhost:5001'
        ];

        // Allow non-browser tools / same-origin (no Origin header)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any Vercel deployments for this frontend project
        if (origin.endsWith('.vercel.app') && origin.includes('ecom-frontend-')) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
const port = process.env.PORT || 5001;

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// MySQL Database configuration
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'ecommerce'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to verify customer token
const verifyCustomerToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.customer = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Generic route handler for all tables
const fetchData = (tableName, idField) => {
    return (req, res) => {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        const query = `SELECT * FROM ?? WHERE ?? = ?`;
        db.query(query, [tableName, idField, id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error', details: err });
            
            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res.status(404).json({ error: 'Record not found' });
            }
        });
    };
};

// Define routes for all tables
const tables = {
    'admin': 'AdminID',
    'analytics': 'AnalyticsID',
    'blog': 'BlogID',
    'cart': 'CartID',
    'category': 'CategoryID',
    'customer': 'CustomerID',
    'customersupport': 'ChatID',
    'discount': 'DiscountID',
    'exchange': 'ExchangeID',
    'faq': 'FAQID',
    'feedback': 'FeedbackID',
    'loyaltypoints': 'LoyaltyID',
    'notification': 'NotificationID',
    'orderitem': 'OrderItemID',
    'orders': 'OrderID',
    'payment': 'PaymentID',
    'product': 'ProductID',
    'returntable': 'ReturnableID',
    'shipping': 'ShippingID',
    'store': 'StoreID',
    'subcategory': 'SubCategoryID',
    'tax': 'TaxID',
    'trackinginfo': 'TrackingID',
    'wishlist': 'WishlistID'
};

// =====================
// CUSTOM API ENDPOINTS
// =====================

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Cart endpoints
app.get('/cart', verifyCustomerToken, (req, res) => {
    const customerId = req.customer.id;
    console.log('Fetching cart for customer:', customerId); // Debug log
    console.log('Fetching cart with token:', req.customer ? req.customer.token : null);
    
    const query = `
        SELECT c.*, p.Name, p.Price, p.Description
        FROM cart c
        JOIN product p ON c.ProductID = p.ProductID
        WHERE c.CustomerID = ?
    `;
    
    db.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ error: 'Database error fetching cart' });
        }
        console.log('Cart results:', results); // Debug log
        res.json(results);
    });
});

app.post('/cart/add', verifyCustomerToken, (req, res) => {
    const { productId, quantity } = req.body;
    const customerId = req.customer.id;
    
    console.log('Adding to cart:', { customerId, productId, quantity }); // Debug log
    
    if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
    }

    // First check if the product exists
    const checkProductQuery = 'SELECT * FROM product WHERE ProductID = ?';
    db.query(checkProductQuery, [productId], (err, productResults) => {
        if (err) {
            console.error('Error checking product:', err);
            return res.status(500).json({ error: 'Database error checking product' });
        }
        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if item already in cart
        const checkCartQuery = 'SELECT * FROM cart WHERE CustomerID = ? AND ProductID = ?';
        db.query(checkCartQuery, [customerId, productId], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).json({ error: 'Database error checking cart' });
            }

            if (cartResults.length > 0) {
                // Update quantity
                const updateQuery = 'UPDATE cart SET Quantity = Quantity + ? WHERE CustomerID = ? AND ProductID = ?';
                db.query(updateQuery, [quantity || 1, customerId, productId], (err2) => {
                    if (err2) {
                        console.error('Error updating cart:', err2);
                        return res.status(500).json({ error: 'Database error updating cart' });
                    }
                    res.json({ message: 'Cart updated' });
                });
            } else {
                // Insert new
                const insertQuery = 'INSERT INTO cart (CustomerID, ProductID, Quantity) VALUES (?, ?, ?)';
                db.query(insertQuery, [customerId, productId, quantity || 1], (err2) => {
                    if (err2) {
                        console.error('Error inserting into cart:', err2);
                        // If it's a duplicate entry error, try updating instead
                        if (err2.code === 'ER_DUP_ENTRY') {
                            const updateQuery = 'UPDATE cart SET Quantity = Quantity + ? WHERE CustomerID = ? AND ProductID = ?';
                            db.query(updateQuery, [quantity || 1, customerId, productId], (err3) => {
                                if (err3) {
                                    console.error('Error updating cart after duplicate:', err3);
                                    return res.status(500).json({ error: 'Database error updating cart' });
                                }
                                res.json({ message: 'Cart updated' });
                            });
                        } else {
                            return res.status(500).json({ error: 'Database error inserting into cart' });
                        }
                    } else {
                        res.json({ message: 'Added to cart' });
                    }
                });
            }
        });
    });
});

app.post('/cart/remove', verifyCustomerToken, (req, res) => {
    const { productId } = req.body;
    const customerId = req.customer.id;
    
    if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
    }

    const query = 'DELETE FROM cart WHERE CustomerID = ? AND ProductID = ?';
    db.query(query, [customerId, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Removed from cart' });
    });
});

app.post('/cart/decrement', verifyCustomerToken, (req, res) => {
    const { productId } = req.body;
    const customerId = req.customer.id;

    console.log('Decrement request:', { customerId, productId });

    if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
    }

    // Get current quantity
    const getQtyQuery = 'SELECT Quantity FROM cart WHERE CustomerID = ? AND ProductID = ?';
    db.query(getQtyQuery, [customerId, productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Item not found in cart' });

        const currentQty = results[0].Quantity;
        console.log('Current quantity:', currentQty);
        if (currentQty > 1) {
            // Decrement quantity
            const updateQuery = 'UPDATE cart SET Quantity = Quantity - 1 WHERE CustomerID = ? AND ProductID = ?';
            db.query(updateQuery, [customerId, productId], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ message: 'Quantity decremented' });
            });
        } else {
            // Remove row
            const deleteQuery = 'DELETE FROM cart WHERE CustomerID = ? AND ProductID = ?';
            db.query(deleteQuery, [customerId, productId], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ message: 'Item removed from cart' });
            });
        }
    });
});

app.post('/cart/increment', verifyCustomerToken, (req, res) => {
    const { productId } = req.body;
    const customerId = req.customer.id;

    if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
    }

    const updateQuery = 'UPDATE cart SET Quantity = Quantity + 1 WHERE CustomerID = ? AND ProductID = ?';
    db.query(updateQuery, [customerId, productId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found in cart' });
        res.json({ message: 'Quantity incremented' });
    });
});

app.get('/cart/count', verifyCustomerToken, (req, res) => {
    const customerId = req.customer.id;
    const query = 'SELECT SUM(Quantity) AS count FROM cart WHERE CustomerID = ?';
    db.query(query, [customerId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error fetching cart count' });
        }
        res.json({ count: results[0].count || 0 });
    });
});

// Wishlist endpoints
app.get('/wishlist', verifyCustomerToken, (req, res) => {
    const customerId = req.customer.id;
    console.log('Fetching wishlist for customer:', customerId); // Debug log
    console.log('Fetching wishlist with token:', req.customer ? req.customer.token : null);
    
    const query = `
        SELECT w.*, p.Name, p.Price, p.Description
        FROM wishlist w
        JOIN product p ON w.ProductID = p.ProductID
        WHERE w.CustomerID = ?
    `;
    
    db.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error fetching wishlist:', err);
            return res.status(500).json({ error: 'Database error fetching wishlist' });
        }
        console.log('Wishlist results:', results); // Debug log
        res.json(results);
    });
});

app.post('/wishlist/add', verifyCustomerToken, (req, res) => {
    const { productId, priority } = req.body;
    const customerId = req.customer.id;

    if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
    }

    // Check if product exists
    db.query('SELECT * FROM product WHERE ProductID = ?', [productId], (err, productResults) => {
        if (err) return res.status(500).json({ error: 'Database error checking product' });
        if (productResults.length === 0) return res.status(404).json({ error: 'Product not found' });

        // Check if already in wishlist
        db.query('SELECT * FROM wishlist WHERE CustomerID = ? AND ProductID = ?', [customerId, productId], (err, wishlistResults) => {
            if (err) return res.status(500).json({ error: 'Database error checking wishlist' });
            if (wishlistResults.length > 0) return res.status(409).json({ error: 'Item already in wishlist' });

            // Insert new
            db.query(
                'INSERT INTO wishlist (CustomerID, ProductID, Priority) VALUES (?, ?, ?)',
                [customerId, productId, priority || 1],
                (err2) => {
                    if (err2) return res.status(500).json({ error: 'Database error inserting into wishlist' });
                    res.json({ message: 'Added to wishlist' });
                }
            );
        });
    });
});

app.post('/wishlist/remove', verifyCustomerToken, (req, res) => {
    const { productId } = req.body;
    const customerId = req.customer.id;

    if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
    }

    const query = 'DELETE FROM wishlist WHERE CustomerID = ? AND ProductID = ?';
    db.query(query, [customerId, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Removed from wishlist' });
    });
});

app.get('/wishlist/count', verifyCustomerToken, (req, res) => {
    const customerId = req.customer.id;
    const query = 'SELECT COUNT(*) AS count FROM wishlist WHERE CustomerID = ?';
    db.query(query, [customerId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error fetching wishlist count' });
        }
        res.json({ count: results[0].count });
    });
});

// Loyalty endpoints
app.post('/loyalty/redeem', verifyCustomerToken, async (req, res) => {
    const { points } = req.body;
    const customerId = req.customer.id;

    // 1. Get current points
    db.query('SELECT Points FROM LoyaltyPoints WHERE CustomerID = ?', [customerId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!rows.length || rows[0].Points < points) {
            return res.status(400).json({ error: 'Not enough points' });
        }

        // 2. Subtract points
        db.query('UPDATE LoyaltyPoints SET Points = Points - ? WHERE CustomerID = ?', [points, customerId], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // 3. Log redemption (optional, for history)
            db.query(
                'INSERT INTO PointsHistory (CustomerID, Points, Description, Date) VALUES (?, ?, ?, NOW())',
                [customerId, -points, 'Redeemed for discount']
            );

            // 4. Calculate discount (example: 100 points = $1)
            let discount = 0;
            if (points === 100) discount = 1;
            else if (points === 500) discount = 5;
            else if (points === 1000) discount = 12;

            res.json({ success: true, discount });
        });
    });
});

app.get('/loyalty/points', verifyCustomerToken, async (req, res) => {
    const customerId = req.customer?.id;
    console.log('Loyalty points request for customer:', customerId);

    if (!customerId) {
        return res.status(400).json({ error: 'Customer ID missing from token' });
    }

    // Helper to run queries that return a promise
    const runQuery = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    try {
        const pointsResult = await runQuery('SELECT Points FROM LoyaltyPoints WHERE CustomerID = ?', [customerId]);
        const points = (Array.isArray(pointsResult) && pointsResult.length > 0) ? pointsResult[0].Points : 0;

        const historyResult = await runQuery('SELECT Points, Description, Date FROM PointsHistory WHERE CustomerID = ? ORDER BY Date DESC', [customerId]);
        const history = Array.isArray(historyResult) ? historyResult.map(row => ({
            points: row.Points,
            description: row.Description,
            date: row.Date
        })) : [];

        res.json({ points, history });
    } catch (err) {
        console.error('Error fetching loyalty points/history for customer', customerId, err);
        res.status(500).json({ error: 'Database error fetching loyalty points' });
    }
});

// Blog endpoints
app.get('/blogs', (req, res) => {
    db.query('SELECT * FROM blog ORDER BY BlogID DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error fetching blogs' });
        res.json(results);
    });
});

app.post('/blogs', (req, res) => {
    const { title, content, author, image } = req.body;
    if (!title || !content || !author) {
        return res.status(400).json({ error: 'Title, content, and author are required' });
    }
    db.query(
        'INSERT INTO blog (Title, Content, Author, Image, Date) VALUES (?, ?, ?, ?, NOW())',
        [title, content, author, image || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error adding blog' });
            res.json({ message: 'Blog added', blogId: result.insertId });
        }
    );
});

// Customer support endpoints
app.post('/customersupport', verifyCustomerToken, (req, res) => {
    const customerId = req.customer.id;
    const { message, response } = req.body; // response can be null/empty if not yet answered

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    db.query(
        'INSERT INTO customersupport (CustomerID, Message, Response, Timestamp) VALUES (?, ?, ?, NOW())',
        [customerId, message, response || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error saving support message' });
            res.json({ message: 'Support message saved', chatId: result.insertId });
        }
    );
});

app.get('/customersupport', verifyCustomerToken, (req, res) => {
    const customerId = req.customer.id;
    db.query(
        'SELECT * FROM customersupport WHERE CustomerID = ? ORDER BY Timestamp DESC',
        [customerId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error fetching support messages' });
            res.json(results);
        }
    );
});

// Admin responds to a customer support message
app.post('/customersupport/respond', verifyAdminToken, (req, res) => {
    const { chatId, response } = req.body;
    if (!chatId || !response) {
        return res.status(400).json({ error: 'chatId and response are required' });
    }
    db.query(
        'UPDATE customersupport SET Response = ? WHERE ChatID = ?',
        [response, chatId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error updating response' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Support message not found' });
            res.json({ message: 'Response updated successfully' });
        }
    );
});

// Discount code endpoint
app.post('/discount/apply', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided.' });
    // For demo: check discount table for a valid, active code
    const query = 'SELECT * FROM discount WHERE Code = ? AND IsActive = 1 LIMIT 1';
    db.query(query, [code], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (results.length === 0) return res.status(404).json({ error: 'Invalid or expired code.' });
        const discount = results[0];
        // Use percentage instead of flat amount
        res.json({ percent: discount.Percentage });
    });
});

// Order/checkout endpoints
app.post('/order/checkout', verifyCustomerToken, async (req, res) => {
    const { items, address } = req.body;
    let paymentMethod = req.body.paymentMethod;
    if (paymentMethod === 'card') paymentMethod = 'Credit Card';
    else if (paymentMethod === 'cod') paymentMethod = 'COD';
    const transactionId = req.body.transactionId || `txn_${Date.now()}`;
    const customerId = req.customer.id;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
    }

    // Fetch tax info for all products in the order
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const taxQuery = `SELECT * FROM tax WHERE ProductID IN (${placeholders})`;
    db.query(taxQuery, productIds, (taxErr, taxResults) => {
        if (taxErr) {
            // If tax table doesn't exist, continue without tax instead of failing checkout
            if (taxErr.code === 'ER_NO_SUCH_TABLE') {
                taxResults = [];
            } else {
                return res.status(500).json({ error: 'Database error fetching tax info' });
            }
        }

        // Map productId to tax info
        const taxMap = {};
        taxResults.forEach(tax => {
            taxMap[tax.ProductID] = tax;
        });

        // Calculate total tax and add to totalAmount
        let totalTax = 0;
        let taxInserts = [];
        items.forEach(item => {
            const taxInfo = taxMap[item.productId];
            if (taxInfo) {
                const itemTax = (item.price * item.quantity) * (taxInfo.TaxRate / 100);
                totalTax += itemTax;
                // Prepare for insert (TaxID is auto-increment, so NULL)
                taxInserts.push([null, item.productId, taxInfo.TaxRate, taxInfo.TaxType]);
            }
        });
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + totalTax;

        db.beginTransaction(err => {
            if (err) return res.status(500).json({ error: 'Database error (begin transaction)' });

            const orderQuery = 'INSERT INTO orders (CustomerID, TotalAmount, OrderDate, Status) VALUES (?, ?, NOW(), ?)';
            db.query(orderQuery, [customerId, totalAmount, 'Processing'], (err, orderResult) => {
                if (err) {
                    db.rollback(() => {});
                    console.log("ye raha");
                    console.log(err);
                    return res.status(500).json({ error: 'Database error (insert order)' });
                }

                const orderId = orderResult.insertId;

                // Insert tax info for each product in the order
                if (taxInserts.length > 0) {
                    const taxInsertQuery = 'INSERT INTO tax (TaxID, ProductID, TaxRate, TaxType) VALUES ?';
                    db.query(taxInsertQuery, [taxInserts], (taxInsertErr) => {
                        if (taxInsertErr) {
                            db.rollback(() => {});
                            return res.status(500).json({ error: 'Database error (insert tax info)' });
                        }
                        // Continue with the rest of the order logic
                        continueOrderPlacement();
                    });
                } else {
                    continueOrderPlacement();
                }

                function continueOrderPlacement() {
                    // Insert shipping info
                    const shippingQuery = 'INSERT INTO shipping (OrderID, Address, Status) VALUES (?, ?, ?)';
                    db.query(shippingQuery, [orderId, address, 'Processing'], (err, shippingResult) => {
                        if (err) {
                            db.rollback(() => {});
                            return res.status(500).json({ error: 'Database error (insert shipping)' });
                        }
                        // Insert into trackinginfo table
                        const trackingInfoQuery = 'INSERT INTO trackinginfo (OrderID, Status, EstimatedDelivery) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))';
                        db.query(trackingInfoQuery, [orderId, 'In Transit'], (err, trackingResult) => {
                            if (err) {
                                db.rollback(() => {});
                                return res.status(500).json({ error: 'Database error (insert tracking info)' });
                            }
                            const trackingId = trackingResult.insertId;
                            // Update shipping with TrackingID
                            const updateShippingQuery = 'UPDATE shipping SET TrackingID = ? WHERE ShippingID = ?';
                            db.query(updateShippingQuery, [trackingId, shippingResult.insertId], (err) => {
                                if (err) {
                                    db.rollback(() => {});
                                    return res.status(500).json({ error: 'Database error (update shipping with tracking ID)' });
                                }
                                // Insert into payment table
                                const paymentQuery = 'INSERT INTO payment (OrderID, Amount, PaymentMethod, PaymentStatus, TransactionID) VALUES (?, ?, ?, ?, ?)';
                                db.query(paymentQuery, [orderId, totalAmount, paymentMethod, 'Pending', transactionId], (err, paymentResult) => {
                                    if (err) {
                                        db.rollback(() => {});
                                        return res.status(500).json({ error: 'Database error (insert payment)' });
                                    }
                                    const paymentId = paymentResult.insertId;
                                    // Update order with PaymentID
                                    const updateOrderQuery = 'UPDATE orders SET PaymentID = ? WHERE OrderID = ?';
                                    db.query(updateOrderQuery, [paymentId, orderId], (err) => {
                                        if (err) {
                                            db.rollback(() => {});
                                            return res.status(500).json({ error: 'Database error (update order with payment ID)' });
                                        }
                                        // Insert order items
                                        const orderItemsData = items.map(item => [orderId, item.productId, item.quantity, item.price * item.quantity]);
                                        const orderItemsQuery = 'INSERT INTO orderitem (OrderID, ProductID, Quantity, Subtotal) VALUES ?';
                                        db.query(orderItemsQuery, [orderItemsData], (err) => {
                                            if (err) {
                                                db.rollback(() => {});
                                                return res.status(500).json({ error: 'Database error (insert order items)' });
                                            }
                                            // Clear cart
                                            const clearCartQuery = 'DELETE FROM cart WHERE CustomerID = ?';
                                            db.query(clearCartQuery, [customerId], (err) => {
                                                if (err) {
                                                    db.rollback(() => {});
                                                    return res.status(500).json({ error: 'Database error (clear cart)' });
                                                }
                                                db.commit(err => {
                                                    if (err) {
                                                        db.rollback(() => {});
                                                        return res.status(500).json({ error: 'Database error (commit)' });
                                                    }
                                                    // Award loyalty points after successful order
                                                    const pointsEarned = Math.floor(totalAmount / 10); // 1 point per $10
                                                    console.log('Loyalty points to award:', pointsEarned, 'for customer:', customerId);
                                                    if (pointsEarned > 0) {
                                                        // Check if customer already has a LoyaltyPoints row
                                                        db.query('SELECT * FROM LoyaltyPoints WHERE CustomerID = ?', [customerId], (err, result) => {
                                                            if (err) {
                                                                console.error('Error checking LoyaltyPoints:', err);
                                                                return res.json({ message: 'Order placed, but error updating loyalty points.' });
                                                            }
                                                            if (result.length > 0) {
                                                                // Update existing
                                                                db.query('UPDATE LoyaltyPoints SET Points = Points + ? WHERE CustomerID = ?', [pointsEarned, customerId], (err2) => {
                                                                    if (err2) {
                                                                        console.error('Error updating LoyaltyPoints:', err2);
                                                                    } else {
                                                                        console.log('LoyaltyPoints updated for customer:', customerId);
                                                                        db.query('INSERT INTO PointsHistory (CustomerID, Points, Description, Date) VALUES (?, ?, ?, NOW())', [customerId, pointsEarned, 'Points earned from order'], (err3) => {
                                                                            if (err3) console.error('Error inserting PointsHistory:', err3);
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                // Insert new
                                                                db.query('INSERT INTO LoyaltyPoints (CustomerID, Points, EarnedDate) VALUES (?, ?, NOW())', [customerId, pointsEarned], (err2) => {
                                                                    if (err2) {
                                                                        console.error('Error inserting LoyaltyPoints:', err2);
                                                                    } else {
                                                                        console.log('LoyaltyPoints inserted for customer:', customerId);
                                                                        db.query('INSERT INTO PointsHistory (CustomerID, Points, Description, Date) VALUES (?, ?, ?, NOW())', [customerId, pointsEarned, 'Points earned from order'], (err3) => {
                                                                            if (err3) console.error('Error inserting PointsHistory:', err3);
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    res.json({ message: 'Order, shipping, payment, and tax placed successfully!', trackingNumber: trackingId, totalTax, loyaltyPoints: pointsEarned });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            });
        });
    });
});

// Return request endpoint
app.post('/return/request', (req, res) => {
    const { orderItemId, email, reason } = req.body;
    if (!orderItemId || !email || !reason) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    // Get PaymentID for this order item
    const paymentIdQuery = `
        SELECT o.PaymentID
        FROM orderitem oi
        JOIN orders o ON oi.OrderID = o.OrderID
        WHERE oi.OrderItemID = ?
    `;
    db.query(paymentIdQuery, [orderItemId], (err, results) => {
        if (err) {
            console.error('Database error (fetching PaymentID):', err);
            return res.status(500).json({ error: 'Database error (fetching PaymentID).' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order item not found.' });
        }
        const paymentId = results[0].PaymentID;
        if (!paymentId) {
            return res.status(400).json({ error: 'No payment found for this order item.' });
    }
    // Insert return request into the returntable table
    const query = `
        INSERT INTO returntable (OrderItemID, PaymentID, Reason, Status, RequestDate)
        VALUES (?, ?, ?, 'Pending', NOW())
    `;
        db.query(query, [orderItemId, paymentId, reason], (err2, result) => {
            if (err2) {
                console.error('Database error on return request:', err2);
                if (err2.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({ error: 'Invalid PaymentID or OrderItemID (foreign key constraint failed).' });
        }
                return res.status(500).json({ error: 'Database error on return request.' });
            }
        res.json({ message: 'Your request is received. We will respond in a few days.' });
        });
    });
});

// =====================
// GENERIC HANDLER FOR ALL TABLES (MUST COME LAST)
// =====================
for (const [table, idField] of Object.entries(tables)) {
    app.get(`/${table}`, fetchData(table, idField));
}

// Admin login route
app.post('/auth/admin-login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM admin WHERE Email = ? AND Password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const admin = results[0];
        const token = jwt.sign(
            { id: admin.AdminID, email: admin.Email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token });
    });
});

// Place ALL /admin API endpoints BEFORE static/catch-all middleware
app.get('/admin/dashboard', verifyAdminToken, (req, res) => {
    const queries = {
        totalProducts: 'SELECT COUNT(*) as count FROM product',
        totalOrders: 'SELECT COUNT(*) as count FROM orders',
        totalUsers: 'SELECT COUNT(*) as count FROM customer',
        totalRevenue: 'SELECT SUM(TotalAmount) as total FROM orders',
        products: 'SELECT p.*, c.Name as CategoryName FROM product p LEFT JOIN category c ON p.CategoryID = c.CategoryID LIMIT 10',
        categories: 'SELECT * FROM category'
    };
    const results = {};
    let completedQueries = 0;
    let hasError = false;
    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, result) => {
            if (hasError) return;
            if (err) {
                console.error(`Error fetching ${key}:`, err);
                console.error(`Failed query for ${key}:`, query);
                hasError = true;
                return res.status(500).json({ error: `Database error on ${key}` });
            }
            if (key === 'totalRevenue') {
                results[key] = result[0].total || 0;
            } else if (key === 'totalProducts' || key === 'totalOrders' || key === 'totalUsers') {
                results[key] = result[0].count;
            } else {
                results[key] = result;
            }
            completedQueries++;
            if (completedQueries === Object.keys(queries).length) {
                console.log('Admin dashboard data:', results);
                res.json(results);
            }
        });
    });
});
app.post('/admin/products', verifyAdminToken, (req, res) => {
    const { name, price, categoryId, description } = req.body;
    if (!name || !price || !categoryId || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const query = 'INSERT INTO product (Name, Price, CategoryID, Description) VALUES (?, ?, ?, ?)';
    db.query(query, [name, price, categoryId, description], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: 'Failed to add product' });
        }
        res.json({ message: 'Product added successfully', productId: result.insertId });
    });
});
app.delete('/admin/products/:id', verifyAdminToken, (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM product WHERE ProductID = ?';
    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});
app.get('/admin/analytics/all', verifyAdminToken, (req, res) => {
    const query = `
        SELECT Metric, Value, Date
        FROM analytics
        ORDER BY Date DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error fetching analytics' });
        res.json(results);
    });
});
app.post('/admin/analytics/calculate-total-sales', verifyAdminToken, (req, res) => {
    db.query('SELECT SUM(TotalAmount) as totalSales FROM orders', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error calculating total sales' });
        const totalSales = results[0].totalSales || 0;
        const today = new Date().toISOString().slice(0, 10);
        db.query(
            'INSERT INTO analytics (StoreID, Metric, Value, Date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE Value = ?',
            [1, 'Total Sales', totalSales, today, totalSales],
            (err2) => {
                if (err2) return res.status(500).json({ error: 'Database error updating analytics' });
                res.json({ message: 'Total sales analytics updated', totalSales });
            }
        );
    });
});
// Place /admin static/catch-all middleware and express.static BELOW all API endpoints
app.use('/admin', (req, res, next) => {
    if (
        req.path === '/login.html' ||
        req.path === '/dashboard.html' ||
        req.path === '/' // handled by /admin route below
    ) {
        return next();
    }
    return res.redirect('/admin/login.html');
});
app.use(express.static(path.join(__dirname)));

// Admin login page route
app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Admin dashboard page route (protected)
app.get('/admin/dashboard.html', (req, res) => {
    // Check for JWT in Authorization header (Bearer token in cookies or headers)
    let token = req.headers.authorization;
    if (!token && req.headers.cookie) {
        // Try to extract token from cookies if present
        const match = req.headers.cookie.match(/adminToken=([^;]+)/);
        if (match) token = `Bearer ${match[1]}`;
    }
    if (token && token.startsWith('Bearer ')) token = token.split(' ')[1];
    if (!token) {
        return res.redirect('/admin/login.html');
    }
    try {
        jwt.verify(token, JWT_SECRET);
        res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
    } catch (err) {
        return res.redirect('/admin/login.html');
    }
});

// Redirect /admin to login.html
app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

// Add CORS headers to allow POST requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Create cart table if it doesn't exist
const createCartTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS cart (
            CartID INT AUTO_INCREMENT PRIMARY KEY,
            CustomerID INT NOT NULL,
            ProductID INT NOT NULL,
            Quantity INT NOT NULL DEFAULT 1,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
            FOREIGN KEY (ProductID) REFERENCES product(ProductID),
            UNIQUE KEY unique_cart_item (CustomerID, ProductID)
        )
    `;
    
    // First check if table exists
    db.query("SHOW TABLES LIKE 'cart'", (err, results) => {
        if (err) {
            console.error('Error checking cart table:', err);
            return;
        }
        
        const tableExists = results.length > 0;
        
        if (!tableExists) {
            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating cart table:', err);
                } else {
                    console.log('Cart table created successfully');
                }
            });
        } else {
            // console.log('Cart table already exists');
        }
    });
};

// Call this function when the server starts
createCartTable();

// User registration route
app.post('/auth/register', (req, res) => {
    const { name, email, password, contact, address } = req.body;
    if (!name || !email || !password || !contact || !address) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    // Check if email already exists
    db.query('SELECT * FROM customer WHERE Email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        // Insert new user with all fields
        db.query('INSERT INTO customer (Name, Email, Password, Contact_no, Address) VALUES (?, ?, ?, ?, ?)', [name, email, password, contact, address], (err2, result) => {
            if (err2) {
                console.error('Database error:', err2);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Registration successful' });
        });
    });
});

// Customer login route
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM customer WHERE Email = ? AND Password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const customer = results[0];
        const token = jwt.sign(
            { id: customer.CustomerID, email: customer.Email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ 
            token,
            CustomerID: customer.CustomerID,
            Name: customer.Name,
            Email: customer.Email
        });
    });
});

// Create orders, orderitem, and product tables if they don't exist
const createOrdersTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS orders (
            OrderID INT AUTO_INCREMENT PRIMARY KEY,
            CustomerID INT NOT NULL,
            TotalAmount DECIMAL(10,2) NOT NULL,
            OrderDate DATETIME NOT NULL,
            Status VARCHAR(50),
            PaymentID INT,
            FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID)
        )
    `;
    db.query(query, (err) => {
        if (err) console.error('Error creating orders table:', err);
    });
};

const createOrderItemTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS orderitem (
            OrderItemID INT AUTO_INCREMENT PRIMARY KEY,
            OrderID INT NOT NULL,
            ProductID INT NOT NULL,
            Quantity INT NOT NULL,
            Subtotal DECIMAL(10,2) NOT NULL,
            PaymentID INT,
            FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
            FOREIGN KEY (ProductID) REFERENCES product(ProductID)
        )
    `;
    db.query(query, (err) => {
        if (err) console.error('Error creating orderitem table:', err);
    });
};

const createProductTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS product (
            ProductID INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255) NOT NULL,
            Price DECIMAL(10,2) NOT NULL,
            CategoryID INT,
            Description TEXT
        )
    `;
    db.query(query, (err) => {
        if (err) console.error('Error creating product table:', err);
    });
};

// Create loyalty points related tables if they don't exist
const createLoyaltyTables = () => {
    const loyaltyTableQuery = `
        CREATE TABLE IF NOT EXISTS LoyaltyPoints (
            LoyaltyID INT AUTO_INCREMENT PRIMARY KEY,
            CustomerID INT NOT NULL,
            Points INT NOT NULL DEFAULT 0,
            EarnedDate DATETIME NOT NULL,
            FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID)
        )
    `;

    const pointsHistoryQuery = `
        CREATE TABLE IF NOT EXISTS PointsHistory (
            HistoryID INT AUTO_INCREMENT PRIMARY KEY,
            CustomerID INT NOT NULL,
            Points INT NOT NULL,
            Description VARCHAR(255),
            Date DATETIME NOT NULL,
            FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID)
        )
    `;

    db.query(loyaltyTableQuery, (err) => {
        if (err) console.error('Error creating LoyaltyPoints table:', err);
    });

    db.query(pointsHistoryQuery, (err) => {
        if (err) console.error('Error creating PointsHistory table:', err);
    });
};

// Call these functions at server startup
createProductTable();
createOrdersTable();
createOrderItemTable();
createLoyaltyTables();

// Get order items for a customer (for returns)
app.get('/orderitems/by-customer', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Find the customer by email
    db.query('SELECT CustomerID FROM customer WHERE Email = ?', [email], (err, customerResults) => {
        if (err) {
            console.error('Database error (customer lookup):', err);
            return res.status(500).json({ error: 'Database error (customer lookup)' });
        }
        if (customerResults.length === 0) return res.status(404).json({ error: 'Customer not found' });

        const customerId = customerResults[0].CustomerID;
        // Get order items for this customer
        db.query(
            `SELECT oi.OrderItemID, oi.ProductID, oi.Quantity, oi.Subtotal, p.Name AS ProductName
             FROM orderitem oi
             JOIN orders o ON oi.OrderID = o.OrderID
             JOIN product p ON oi.ProductID = p.ProductID
             WHERE o.CustomerID = ?
             ORDER BY oi.OrderItemID DESC`,
            [customerId],
            (err2, items) => {
                if (err2) {
                    console.error('Database error (order items):', err2);
                    return res.status(500).json({ error: 'Database error (order items)' });
                }
                res.json(items);
            }
        );
    });
});

// Get return requests for a customer (with product info)
app.get('/returns/by-customer', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.query('SELECT CustomerID FROM customer WHERE Email = ?', [email], (err, customerResults) => {
        if (err) return res.status(500).json({ error: 'Database error (customer lookup)' });
        if (customerResults.length === 0) return res.status(404).json({ error: 'Customer not found' });
        const customerId = customerResults[0].CustomerID;
        // Join returntable -> orderitem -> product
        const query = `
            SELECT r.ReturnableID, r.OrderItemID, r.PaymentID, r.Reason, r.Status, r.RequestDate,
                   p.ProductID, p.Name AS ProductName, p.Description, p.Price
            FROM returntable r
            JOIN orderitem oi ON r.OrderItemID = oi.OrderItemID
            JOIN orders o ON oi.OrderID = o.OrderID
            JOIN product p ON oi.ProductID = p.ProductID
            WHERE o.CustomerID = ?
            ORDER BY r.RequestDate DESC
        `;
        db.query(query, [customerId], (err2, results) => {
            if (err2) return res.status(500).json({ error: 'Database error (returns lookup)' });
            res.json(results);
        });
    });
});

// Get all order items for a customer, with return status if exists
app.get('/orderitems-with-returns', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.query('SELECT CustomerID FROM customer WHERE Email = ?', [email], (err, customerResults) => {
        if (err) return res.status(500).json({ error: 'Database error (customer lookup)' });
        if (customerResults.length === 0) return res.status(404).json({ error: 'Customer not found' });

        const customerId = customerResults[0].CustomerID;
        // LEFT JOIN orderitem with returntable
        const query = `
            SELECT 
                oi.OrderItemID, oi.OrderID, oi.ProductID, oi.Quantity, oi.Subtotal,
                p.Name AS ProductName, p.Description, p.Price,
                r.ReturnableID, r.Status AS ReturnStatus, r.RequestDate, r.Reason
            FROM orderitem oi
            JOIN orders o ON oi.OrderID = o.OrderID
            JOIN product p ON oi.ProductID = p.ProductID
            LEFT JOIN returntable r ON oi.OrderItemID = r.OrderItemID
            WHERE o.CustomerID = ?
            ORDER BY oi.OrderItemID DESC
        `;
        db.query(query, [customerId], (err2, results) => {
            if (err2) return res.status(500).json({ error: 'Database error (order items/returns)' });
            res.json(results);
        });
    });
});

// Get reviews for a product
app.get('/reviews', (req, res) => {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: 'ProductID is required' });
    db.query(
        'SELECT f.Rating, f.Comment, f.Date, c.Name AS CustomerName FROM feedback f LEFT JOIN customer c ON f.CustomerID = c.CustomerID WHERE f.ProductID = ? ORDER BY f.Date DESC',
        [productId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error fetching reviews' });
            res.json(results.map(r => ({
                Rating: r.Rating,
                Review: r.Comment,
                CustomerName: r.CustomerName,
                Date: r.Date
            })));
        }
    );
});

// Add a review for a product
app.post('/reviews', (req, res) => {
    const { productId, customerId, rating, review } = req.body;
    console.log('Review POST body:', req.body); // Debug log
    if (!productId || !customerId || !rating || !review) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const date = new Date().toISOString().slice(0, 10);
    db.query(
        'INSERT INTO feedback (ProductID, CustomerID, Rating, Comment, Date) VALUES (?, ?, ?, ?, ?)',
        [productId, customerId, rating, review, date],
        (err, result) => {
            if (err) {
                console.error('Error inserting review:', err); // Debug log
                return res.status(500).json({ error: 'Database error adding review' });
            }
            res.json({ message: 'Review submitted successfully' });
        }
    );
});

// Exchange request endpoint
app.post('/exchange/request', (req, res) => {
    const { orderItemId, productId, reason, customerId } = req.body;
    if (!orderItemId || !productId || !reason || !customerId) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const date = new Date().toISOString().slice(0, 10);
    // Insert into exchange table
    db.query(
        'INSERT INTO exchange (OrderItemID, ProductID, ExchangeReason, ExchangeDate, Status) VALUES (?, ?, ?, ?, ?)',
        [orderItemId, productId, reason, date, 'Pending'],
        (err, result) => {
            if (err) {
                console.error('Database error adding exchange:', err);
                return res.status(500).json({ error: 'Database error adding exchange request' });
            }
            res.json({ message: 'Exchange request submitted successfully!' });
        }
    );
});

// Get previous exchange requests for a customer
app.get('/exchange/by-customer', (req, res) => {
    const { customerId } = req.query;
    if (!customerId) return res.status(400).json({ error: 'CustomerID is required' });
    // Join exchange -> orderitem -> product to get product info
    const query = `
        SELECT e.*, p.Name AS ProductName
        FROM exchange e
        JOIN orderitem oi ON e.OrderItemID = oi.OrderItemID
        JOIN product p ON e.ProductID = p.ProductID
        JOIN orders o ON oi.OrderID = o.OrderID
        WHERE o.CustomerID = ?
        ORDER BY e.ExchangeDate DESC
    `;
    db.query(query, [customerId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error fetching exchanges' });
        res.json(results);
    });
});

// CATEGORY ENDPOINT for frontend product page
app.get('/category', (req, res) => {
    db.query('SELECT * FROM category', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));




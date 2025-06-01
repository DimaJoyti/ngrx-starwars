package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// MarketplaceItem represents a product in the marketplace
type MarketplaceItem struct {
	ID               string          `json:"id"`
	Name             string          `json:"name"`
	Description      string          `json:"description"`
	ShortDescription string          `json:"short_description,omitempty"`
	Price            float64         `json:"price"`
	OriginalPrice    *float64        `json:"original_price,omitempty"`
	Currency         string          `json:"currency"`
	IsOnSale         bool            `json:"is_on_sale"`
	SalePercentage   *int            `json:"sale_percentage,omitempty"`
	Category         string          `json:"category"`
	Subcategory      string          `json:"subcategory,omitempty"`
	Brand            string          `json:"brand"`
	Manufacturer     string          `json:"manufacturer"`
	SKU              string          `json:"sku"`
	Images           []ProductImage  `json:"images"`
	Videos           []ProductVideo  `json:"videos,omitempty"`
	InStock          bool            `json:"in_stock"`
	StockQuantity    int             `json:"stock_quantity"`
	Availability     string          `json:"availability"`
	ReleaseDate      *time.Time      `json:"release_date,omitempty"`
	Rating           float64         `json:"rating"`
	ReviewCount      int             `json:"review_count"`
	Reviews          []ProductReview `json:"reviews,omitempty"`
	Tags             []string        `json:"tags"`
	Rarity           string          `json:"rarity"`
	IsExclusive      bool            `json:"is_exclusive"`
	IsFeatured       bool            `json:"is_featured"`
	IsNew            bool            `json:"is_new"`
	SourceURL        string          `json:"source_url"`
	SourceStore      string          `json:"source_store"`
	LastUpdated      time.Time       `json:"last_updated"`
	RelatedItems     []string        `json:"related_items,omitempty"`
	BundleItems      []string        `json:"bundle_items,omitempty"`
	Has3DModel       bool            `json:"has_3d_model"`
	Model3DURL       string          `json:"model_3d_url,omitempty"`
	HasARSupport     bool            `json:"has_ar_support"`
}

type ProductImage struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	AltText   string `json:"alt_text"`
	IsPrimary bool   `json:"is_primary"`
	Order     int    `json:"order"`
	Type      string `json:"type"`
}

type ProductVideo struct {
	ID           string `json:"id"`
	URL          string `json:"url"`
	ThumbnailURL string `json:"thumbnail_url"`
	Title        string `json:"title"`
	Duration     int    `json:"duration"`
	Type         string `json:"type"`
}

type ProductReview struct {
	ID                 string    `json:"id"`
	UserID             string    `json:"user_id"`
	UserName           string    `json:"user_name"`
	Rating             float64   `json:"rating"`
	Title              string    `json:"title"`
	Content            string    `json:"content"`
	IsVerifiedPurchase bool      `json:"is_verified_purchase"`
	HelpfulCount       int       `json:"helpful_count"`
	CreatedAt          time.Time `json:"created_at"`
	Images             []string  `json:"images,omitempty"`
}

type ShoppingCart struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id,omitempty"`
	Items     []CartItem `json:"items"`
	Subtotal  float64    `json:"subtotal"`
	Tax       float64    `json:"tax"`
	Shipping  float64    `json:"shipping"`
	Total     float64    `json:"total"`
	Currency  string     `json:"currency"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type CartItem struct {
	ID              string          `json:"id"`
	ProductID       string          `json:"product_id"`
	Product         MarketplaceItem `json:"product"`
	Quantity        int             `json:"quantity"`
	SelectedVariant *ProductVariant `json:"selected_variant,omitempty"`
	AddedAt         time.Time       `json:"added_at"`
	Price           float64         `json:"price"`
}

type ProductVariant struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Value         string  `json:"value"`
	PriceModifier float64 `json:"price_modifier"`
	StockQuantity int     `json:"stock_quantity"`
}

type SearchQuery struct {
	Query    string                 `json:"query"`
	Filters  map[string]interface{} `json:"filters"`
	SortBy   string                 `json:"sort_by"`
	Page     int                    `json:"page"`
	PageSize int                    `json:"page_size"`
}

type SearchResult struct {
	Items       []MarketplaceItem `json:"items"`
	TotalCount  int               `json:"total_count"`
	Facets      SearchFacets      `json:"facets"`
	Suggestions []string          `json:"suggestions"`
}

type SearchFacets struct {
	Categories  []FacetItem `json:"categories"`
	Brands      []FacetItem `json:"brands"`
	PriceRanges []FacetItem `json:"price_ranges"`
	Ratings     []FacetItem `json:"ratings"`
}

type FacetItem struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type MarketplaceSync struct {
	ID             string     `json:"id"`
	StartedAt      time.Time  `json:"started_at"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`
	Status         string     `json:"status"`
	ItemsProcessed int        `json:"items_processed"`
	ItemsAdded     int        `json:"items_added"`
	ItemsUpdated   int        `json:"items_updated"`
	Errors         []string   `json:"errors"`
}

// Mock data for demonstration
var mockProducts = []MarketplaceItem{
	{
		ID:               "sw-001",
		Name:             "Star Wars The Black Series Darth Vader",
		Description:      "Highly detailed 6-inch action figure of the iconic Sith Lord",
		ShortDescription: "Premium Darth Vader action figure",
		Price:            24.99,
		OriginalPrice:    nil,
		Currency:         "USD",
		IsOnSale:         false,
		Category:         "action-figures",
		Brand:            "Hasbro",
		Manufacturer:     "Hasbro",
		SKU:              "HSB-SW-DV-001",
		Images: []ProductImage{
			{
				ID:        "img-001",
				URL:       "https://images.bigbadtoystore.com/images/p/full/2021/04/darth-vader-black-series.jpg",
				AltText:   "Darth Vader Black Series Figure",
				IsPrimary: true,
				Order:     1,
				Type:      "product",
			},
		},
		InStock:       true,
		StockQuantity: 15,
		Availability:  "in-stock",
		Rating:        4.8,
		ReviewCount:   127,
		Tags:          []string{"darth-vader", "sith", "empire", "black-series"},
		Rarity:        "rare",
		IsExclusive:   false,
		IsFeatured:    true,
		IsNew:         false,
		SourceURL:     "https://www.bigbadtoystore.com/Product/VariationDetails/123456",
		SourceStore:   "bigbadtoystore",
		LastUpdated:   time.Now(),
		Has3DModel:    true,
		HasARSupport:  true,
	},
	{
		ID:               "sw-002",
		Name:             "Hot Toys The Mandalorian Sixth Scale Figure",
		Description:      "Premium 1/6 scale collectible figure with detailed armor and accessories",
		ShortDescription: "Premium Mandalorian collectible",
		Price:            279.99,
		OriginalPrice:    func() *float64 { p := 299.99; return &p }(),
		Currency:         "USD",
		IsOnSale:         true,
		SalePercentage:   func() *int { p := 7; return &p }(),
		Category:         "statues",
		Brand:            "Hot Toys",
		Manufacturer:     "Hot Toys",
		SKU:              "HT-SW-MANDO-001",
		Images: []ProductImage{
			{
				ID:        "img-002",
				URL:       "https://www.sideshow.com/storage/product-images/908289/the-mandalorian_star-wars_gallery.jpg",
				AltText:   "Hot Toys Mandalorian Figure",
				IsPrimary: true,
				Order:     1,
				Type:      "product",
			},
		},
		InStock:       true,
		StockQuantity: 8,
		Availability:  "in-stock",
		Rating:        4.9,
		ReviewCount:   89,
		Tags:          []string{"mandalorian", "hot-toys", "premium", "sixth-scale"},
		Rarity:        "legendary",
		IsExclusive:   true,
		IsFeatured:    true,
		IsNew:         false,
		SourceURL:     "https://www.sideshow.com/collectibles/star-wars-the-mandalorian-hot-toys-908289",
		SourceStore:   "sideshow",
		LastUpdated:   time.Now(),
		Has3DModel:    false,
		HasARSupport:  false,
	},
}

var mockCart = &ShoppingCart{
	ID:        "cart-001",
	Items:     []CartItem{},
	Subtotal:  0,
	Tax:       0,
	Shipping:  0,
	Total:     0,
	Currency:  "USD",
	CreatedAt: time.Now(),
	UpdatedAt: time.Now(),
}

// GetProducts returns all marketplace products with optional filtering
func GetProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Parse query parameters for filtering
	category := r.URL.Query().Get("category")
	rarity := r.URL.Query().Get("rarity")
	inStockOnly := r.URL.Query().Get("inStock") == "true"
	onSaleOnly := r.URL.Query().Get("onSale") == "true"

	// Filter products based on query parameters
	filteredProducts := make([]MarketplaceItem, 0)
	for _, product := range mockProducts {
		// Apply filters
		if category != "" && category != "all" && product.Category != category {
			continue
		}
		if rarity != "" && rarity != "all" && product.Rarity != rarity {
			continue
		}
		if inStockOnly && !product.InStock {
			continue
		}
		if onSaleOnly && !product.IsOnSale {
			continue
		}

		filteredProducts = append(filteredProducts, product)
	}

	if err := json.NewEncoder(w).Encode(filteredProducts); err != nil {
		http.Error(w, "Failed to encode products", http.StatusInternalServerError)
		return
	}
}

// GetProductByID returns a specific product by ID
func GetProductByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// This function is now mainly used by the Gin wrapper
	// The actual ID extraction is handled in GetProductByIDGin
	http.Error(w, "Use GetProductByIDGin instead", http.StatusNotImplemented)
}

// GetFeaturedProducts returns featured products
func GetFeaturedProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	featuredProducts := make([]MarketplaceItem, 0)
	for _, product := range mockProducts {
		if product.IsFeatured {
			featuredProducts = append(featuredProducts, product)
		}
	}

	if err := json.NewEncoder(w).Encode(featuredProducts); err != nil {
		http.Error(w, "Failed to encode featured products", http.StatusInternalServerError)
		return
	}
}

// GetSaleProducts returns products on sale
func GetSaleProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	saleProducts := make([]MarketplaceItem, 0)
	for _, product := range mockProducts {
		if product.IsOnSale {
			saleProducts = append(saleProducts, product)
		}
	}

	if err := json.NewEncoder(w).Encode(saleProducts); err != nil {
		http.Error(w, "Failed to encode sale products", http.StatusInternalServerError)
		return
	}
}

// SearchProducts performs product search with filters
func SearchProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var searchQuery SearchQuery
	if err := json.NewDecoder(r.Body).Decode(&searchQuery); err != nil {
		http.Error(w, "Invalid search query", http.StatusBadRequest)
		return
	}

	// Perform search (simplified implementation)
	results := make([]MarketplaceItem, 0)
	for _, product := range mockProducts {
		if searchQuery.Query == "" ||
			strings.Contains(strings.ToLower(product.Name), strings.ToLower(searchQuery.Query)) ||
			strings.Contains(strings.ToLower(product.Description), strings.ToLower(searchQuery.Query)) {
			results = append(results, product)
		}
	}

	searchResult := SearchResult{
		Items:      results,
		TotalCount: len(results),
		Facets: SearchFacets{
			Categories: []FacetItem{
				{Name: "action-figures", Count: 1},
				{Name: "statues", Count: 1},
			},
			Brands: []FacetItem{
				{Name: "Hasbro", Count: 1},
				{Name: "Hot Toys", Count: 1},
			},
		},
		Suggestions: []string{},
	}

	if err := json.NewEncoder(w).Encode(searchResult); err != nil {
		http.Error(w, "Failed to encode search results", http.StatusInternalServerError)
		return
	}
}

// GetCart returns the current shopping cart
func GetCart(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if err := json.NewEncoder(w).Encode(mockCart); err != nil {
		http.Error(w, "Failed to encode cart", http.StatusInternalServerError)
		return
	}
}

// AddToCart adds an item to the shopping cart
func AddToCart(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var cartRequest struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&cartRequest); err != nil {
		http.Error(w, "Invalid cart request", http.StatusBadRequest)
		return
	}

	// Find the product
	var product *MarketplaceItem
	for _, p := range mockProducts {
		if p.ID == cartRequest.ProductID {
			product = &p
			break
		}
	}

	if product == nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// Add to cart
	cartItem := CartItem{
		ID:        fmt.Sprintf("item-%d", len(mockCart.Items)+1),
		ProductID: product.ID,
		Product:   *product,
		Quantity:  cartRequest.Quantity,
		AddedAt:   time.Now(),
		Price:     product.Price,
	}

	mockCart.Items = append(mockCart.Items, cartItem)
	mockCart.Subtotal += product.Price * float64(cartRequest.Quantity)
	mockCart.Tax = mockCart.Subtotal * 0.08 // 8% tax
	mockCart.Shipping = 9.99
	mockCart.Total = mockCart.Subtotal + mockCart.Tax + mockCart.Shipping
	mockCart.UpdatedAt = time.Now()

	if err := json.NewEncoder(w).Encode(mockCart); err != nil {
		http.Error(w, "Failed to encode cart", http.StatusInternalServerError)
		return
	}
}

// SyncWithBrightData initiates sync with Bright Data MCP
func SyncWithBrightData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	sync := MarketplaceSync{
		ID:             fmt.Sprintf("sync-%d", time.Now().Unix()),
		StartedAt:      time.Now(),
		Status:         "running",
		ItemsProcessed: 0,
		ItemsAdded:     0,
		ItemsUpdated:   0,
		Errors:         []string{},
	}

	// Simulate sync completion
	go func() {
		time.Sleep(3 * time.Second)
		sync.Status = "completed"
		sync.CompletedAt = func() *time.Time { t := time.Now(); return &t }()
		sync.ItemsProcessed = 50
		sync.ItemsAdded = 5
		sync.ItemsUpdated = 45
		log.Printf("Sync completed: %+v", sync)
	}()

	if err := json.NewEncoder(w).Encode(sync); err != nil {
		http.Error(w, "Failed to encode sync status", http.StatusInternalServerError)
		return
	}
}

// ===== GIN WRAPPER FUNCTIONS =====

// GetProductsGin - Gin wrapper for GetProducts
func GetProductsGin(c *gin.Context) {
	GetProducts(c.Writer, c.Request)
}

// GetProductByIDGin - Gin wrapper for GetProductByID
func GetProductByIDGin(c *gin.Context) {
	// Add ID to request context for mux compatibility
	req := c.Request
	req = req.WithContext(c)

	// Create a simple ID extraction since we're using Gin
	productID := c.Param("id")

	// Find the product
	for _, product := range mockProducts {
		if product.ID == productID {
			c.JSON(http.StatusOK, product)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
}

// GetFeaturedProductsGin - Gin wrapper for GetFeaturedProducts
func GetFeaturedProductsGin(c *gin.Context) {
	GetFeaturedProducts(c.Writer, c.Request)
}

// GetSaleProductsGin - Gin wrapper for GetSaleProducts
func GetSaleProductsGin(c *gin.Context) {
	GetSaleProducts(c.Writer, c.Request)
}

// SearchProductsGin - Gin wrapper for SearchProducts
func SearchProductsGin(c *gin.Context) {
	SearchProducts(c.Writer, c.Request)
}

// GetCartGin - Gin wrapper for GetCart
func GetCartGin(c *gin.Context) {
	GetCart(c.Writer, c.Request)
}

// AddToCartGin - Gin wrapper for AddToCart
func AddToCartGin(c *gin.Context) {
	AddToCart(c.Writer, c.Request)
}

// SyncWithBrightDataGin - Gin wrapper for SyncWithBrightData
func SyncWithBrightDataGin(c *gin.Context) {
	SyncWithBrightData(c.Writer, c.Request)
}

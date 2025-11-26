$base = 'http://localhost:5000'

Write-Host "Testing seller orders endpoint via PowerShell\n"

# 1. Register seller
$sellerEmail = "seller-$(Get-Date -UFormat %s)@test.com"
$registerBody = @{ name='PS Seller'; email=$sellerEmail; password='password123'; storeName='PS Store' } | ConvertTo-Json
Write-Host "Registering seller: $sellerEmail"
$reg = Invoke-RestMethod -Uri "$base/api/sellers/register" -Method Post -Body $registerBody -ContentType 'application/json' -ErrorAction Stop
$sellerToken = $reg.token
Write-Host "Seller token length: $($sellerToken.Length)" -ForegroundColor Green

# 2. Create product as seller
$prodBody = @{ name='PS Test Product'; description='PS product'; price=55.5; category='Accessories'; subCategory='Keychains'; stock=10 } | ConvertTo-Json
Write-Host "Creating product as seller..."
$prod = Invoke-RestMethod -Uri "$base/api/products" -Method Post -Body $prodBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $sellerToken" } -ErrorAction Stop
Write-Host "Product created with ID: $($prod.id)" -ForegroundColor Green

# 3. Register customer
$customerEmail = "customer-$(Get-Date -UFormat %s)@test.com"
$custBody = @{ name='PS Customer'; email=$customerEmail; password='password123' } | ConvertTo-Json
Write-Host "Registering customer: $customerEmail"
$cres = Invoke-RestMethod -Uri "$base/api/users/register" -Method Post -Body $custBody -ContentType 'application/json' -ErrorAction Stop
$userToken = $cres.token
Write-Host "Customer token length: $($userToken.Length)" -ForegroundColor Green

# 4. Create order as customer
Write-Host "Creating order for product ID $($prod.id)"
$orderBody = @{
    items = @(@{ productId = $prod.id; quantity = 2; price = $prod.price; name = $prod.name })
    address = @{ firstName='John'; lastName='Doe'; email='john@test.com'; street='1 Main'; city='City'; state='State'; zipcode='12345'; country='Country'; phone='123' }
    paymentMethod = 'cod'
    subtotal = ($prod.price * 2)
    commission = 5
} | ConvertTo-Json -Depth 5

$ord = Invoke-RestMethod -Uri "$base/api/orders" -Method Post -Body $orderBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $userToken" } -ErrorAction Stop
Write-Host "Order created with ID: $($ord.id)" -ForegroundColor Green

# 5. Fetch seller orders
Write-Host "Fetching seller orders for seller..."
$so = Invoke-RestMethod -Uri "$base/api/sellers/orders" -Method Get -Headers @{ Authorization = "Bearer $sellerToken" } -ErrorAction Stop
Write-Host "Seller Orders Count: $($so.Length)" -ForegroundColor Cyan
if ($so.Length -gt 0) {
    $first = $so[0]
    Write-Host "First order id: $($first.id)"
    Write-Host "Seller items count: $($first.sellerItems.Count)"
    $first.sellerItems | ForEach-Object { Write-Host " - $($_.name) x$($_.quantity) @ $($_.price)" }
}

Write-Host "Done."

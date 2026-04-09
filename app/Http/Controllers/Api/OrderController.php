<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Tax;
use App\Models\Ticket;
use App\Models\TicketLine;
use App\Models\TicketsNum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_address' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Find or create customer
            $customer = Customer::firstOrCreate(
                ['phone' => $request->customer_phone],
                [
                    'searchkey' => $request->customer_phone,
                    'name' => $request->customer_name,
                    'address' => $request->customer_address ?? '',
                    'visible' => 1
                ]
            );

            // Get next ticket number
            $ticketsNum = TicketsNum::first();
            if (!$ticketsNum) {
                $ticketsNum = TicketsNum::create(['id' => 1]);
            }
            $nextTicketId = $ticketsNum->id;
            $ticketsNum->increment('id');

            // Create ticket header
            $ticket = Ticket::create([
                'tickettype' => 0,
                'ticketid' => $nextTicketId,
                'person' => 'ONLINE',
                'customer' => $customer->id,
                'status' => 0
            ]);

            // Create ticket lines
            $lineNo = 0;
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                // Get tax ID from taxcat (you may need to join)
                $tax = Tax::where('category', $product->taxcat)->first();
                $taxId = $tax ? $tax->id : null;

                TicketLine::create([
                    'ticket' => $ticket->id,
                    'line' => $lineNo++,
                    'product' => $product->id,
                    'units' => $item['quantity'],
                    'price' => $product->pricesell,
                    'taxid' => $taxId,
                    'attributes' => null
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order_id' => $ticket->ticketid
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order: ' . $e->getMessage()
            ], 500);
        }
    }
}
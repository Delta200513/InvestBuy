package com.example.investmobile.ui.dashboard

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.investmobile.R
import com.example.investmobile.data.model.Stock
import com.example.investmobile.data.repository.DataRepository
import com.example.investmobile.ui.adapters.StocksAdapter
import java.text.NumberFormat
import java.util.Locale

class DashboardFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: StocksAdapter
    private val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.recyclerView)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())

        val stocks = DataRepository.getStocks()
        adapter = StocksAdapter(stocks) { stock ->
            showBuyDialog(stock)
        }
        recyclerView.adapter = adapter
    }

    private fun showBuyDialog(stock: Stock) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_buy, null)
        val tvStockInfo = dialogView.findViewById<android.widget.TextView>(R.id.tvStockInfo)
        val etQuantity = dialogView.findViewById<android.widget.EditText>(R.id.etQuantity)

        tvStockInfo.text = "Текущая цена: ${currencyFormat.format(stock.price)}"

        AlertDialog.Builder(requireContext())
            .setTitle("Покупка ${stock.symbol}")
            .setView(dialogView)
            .setPositiveButton("Купить") { _, _ ->
                val quantityStr = etQuantity.text.toString()
                val quantity = quantityStr.toIntOrNull()

                if (quantity != null && quantity > 0) {
                    val success = DataRepository.buyStock(stock.symbol, quantity, stock.price)
                    if (success) {
                        Toast.makeText(requireContext(), "Покупка выполнена!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(requireContext(), "Недостаточно средств", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(requireContext(), "Введите корректное количество", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Отмена", null)
            .show()
    }

    override fun onResume() {
        super.onResume()
        // Обновляем список акций
        val stocks = DataRepository.getStocks()
        adapter.updateData(stocks)
    }
}
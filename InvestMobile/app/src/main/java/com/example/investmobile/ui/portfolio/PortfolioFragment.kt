package com.example.investmobile.ui.portfolio

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
import com.example.investmobile.data.model.PortfolioItem
import com.example.investmobile.data.repository.DataRepository
import com.example.investmobile.ui.adapters.PortfolioAdapter
import java.text.NumberFormat
import java.util.Locale

class PortfolioFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var tvBudget: android.widget.TextView
    private lateinit var btnDeposit: android.widget.Button
    private lateinit var adapter: PortfolioAdapter
    private val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_portfolio, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        tvBudget = view.findViewById(R.id.tvBudget)
        btnDeposit = view.findViewById(R.id.btnDeposit)
        recyclerView = view.findViewById(R.id.recyclerView)

        recyclerView.layoutManager = LinearLayoutManager(requireContext())

        updateUI()

        btnDeposit.setOnClickListener {
            showDepositDialog()
        }
    }

    private fun updateUI() {
        val budget = DataRepository.getBudget()
        tvBudget.text = currencyFormat.format(budget)

        val portfolio = DataRepository.getPortfolio()
        adapter = PortfolioAdapter(portfolio) { item ->
            showSellDialog(item)
        }
        recyclerView.adapter = adapter
    }

    private fun showSellDialog(item: PortfolioItem) {
        AlertDialog.Builder(requireContext())
            .setTitle("Продажа ${item.symbol}")
            .setMessage("В наличии: ${item.quantity} шт.\nТекущая цена: ${currencyFormat.format(item.currentPrice)}\n\nВведите количество:")
            .setView(R.layout.dialog_buy)
            .setPositiveButton("Продать") { dialog, _ ->
                val etQuantity = (dialog as AlertDialog).findViewById<android.widget.EditText>(R.id.etQuantity)
                val quantityStr = etQuantity?.text.toString()
                val quantity = quantityStr.toIntOrNull()

                if (quantity != null && quantity > 0 && quantity <= item.quantity) {
                    val success = DataRepository.sellStock(item.symbol, quantity, item.currentPrice)
                    if (success) {
                        Toast.makeText(requireContext(), "Продажа выполнена!", Toast.LENGTH_SHORT).show()
                        updateUI()
                    }
                } else {
                    Toast.makeText(requireContext(), "Введите корректное количество", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Отмена", null)
            .show()
    }

    private fun showDepositDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_deposit, null)
        val etAmount = dialogView.findViewById<android.widget.EditText>(R.id.etAmount)

        AlertDialog.Builder(requireContext())
            .setTitle("Пополнение баланса")
            .setView(dialogView)
            .setPositiveButton("Пополнить") { _, _ ->
                val amountStr = etAmount.text.toString()
                val amount = amountStr.toDoubleOrNull()

                if (amount != null && amount > 0) {
                    DataRepository.deposit(amount)
                    updateUI()
                    Toast.makeText(requireContext(), "Баланс пополнен!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(requireContext(), "Введите корректную сумму", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Отмена", null)
            .show()
    }

    override fun onResume() {
        super.onResume()
        updateUI()
    }
}
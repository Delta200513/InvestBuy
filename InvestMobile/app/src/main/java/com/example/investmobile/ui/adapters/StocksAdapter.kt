package com.example.investmobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.investmobile.R
import com.example.investmobile.data.model.Stock
import java.text.NumberFormat
import java.util.Locale

class StocksAdapter(
    private var stocks: List<Stock>,
    private val onItemClick: (Stock) -> Unit
) : RecyclerView.Adapter<StocksAdapter.StockViewHolder>() {

    private val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)

    class StockViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvSymbol: TextView = itemView.findViewById(R.id.tvSymbol)
        val tvName: TextView = itemView.findViewById(R.id.tvName)
        val tvPrice: TextView = itemView.findViewById(R.id.tvPrice)
        val tvChange: TextView = itemView.findViewById(R.id.tvChange)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StockViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_stock, parent, false)
        return StockViewHolder(view)
    }

    override fun onBindViewHolder(holder: StockViewHolder, position: Int) {
        val stock = stocks[position]
        holder.tvSymbol.text = stock.symbol
        holder.tvName.text = stock.name
        holder.tvPrice.text = currencyFormat.format(stock.price)

        val changeText = String.format("%+.2f (%.2f%%)", stock.change, stock.changePercent)
        holder.tvChange.text = changeText
        holder.tvChange.setTextColor(
            if (stock.change >= 0)
                android.graphics.Color.parseColor("#27ae60")
            else
                android.graphics.Color.parseColor("#e74c3c")
        )

        holder.itemView.setOnClickListener {
            onItemClick(stock)
        }
    }

    override fun getItemCount() = stocks.size

    fun updateData(newStocks: List<Stock>) {
        stocks = newStocks
        notifyDataSetChanged()
    }
}
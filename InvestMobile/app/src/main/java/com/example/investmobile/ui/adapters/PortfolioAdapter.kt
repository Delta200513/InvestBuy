package com.example.investmobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.investmobile.R
import com.example.investmobile.data.model.PortfolioItem
import java.text.NumberFormat
import java.util.Locale

class PortfolioAdapter(
    private var items: List<PortfolioItem>,
    private val onItemClick: (PortfolioItem) -> Unit
) : RecyclerView.Adapter<PortfolioAdapter.PortfolioViewHolder>() {

    private val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)

    class PortfolioViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvSymbol: TextView = itemView.findViewById(R.id.tvSymbol)
        val tvName: TextView = itemView.findViewById(R.id.tvName)
        val tvQuantity: TextView = itemView.findViewById(R.id.tvQuantity)
        val tvPrice: TextView = itemView.findViewById(R.id.tvPrice)
        val tvTotal: TextView = itemView.findViewById(R.id.tvTotal)
        val tvProfit: TextView = itemView.findViewById(R.id.tvProfit)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PortfolioViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_portfolio, parent, false)
        return PortfolioViewHolder(view)
    }

    override fun onBindViewHolder(holder: PortfolioViewHolder, position: Int) {
        val item = items[position]
        holder.tvSymbol.text = item.symbol
        holder.tvName.text = item.name
        holder.tvQuantity.text = "${item.quantity} шт."
        holder.tvPrice.text = currencyFormat.format(item.currentPrice)
        holder.tvTotal.text = currencyFormat.format(item.totalValue)

        val profitText = if (item.profit >= 0)
            "+${currencyFormat.format(item.profit)}"
        else
            currencyFormat.format(item.profit)

        holder.tvProfit.text = profitText
        holder.tvProfit.setTextColor(
            if (item.profit >= 0)
                android.graphics.Color.parseColor("#27ae60")
            else
                android.graphics.Color.parseColor("#e74c3c")
        )

        holder.itemView.setOnClickListener {
            onItemClick(item)
        }
    }

    override fun getItemCount() = items.size

    fun updateData(newItems: List<PortfolioItem>) {
        items = newItems
        notifyDataSetChanged()
    }
}
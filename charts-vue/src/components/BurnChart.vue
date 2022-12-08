<script setup>
import { ref, onMounted } from 'vue'
import get from 'axios'
import { utils } from 'ethers'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

// reactive state
const count = ref(0)
const data = ref({
            labels: [0],
            datasets: [
                {
                    label: 'Data One',
                    backgroundColor: '#f87979',
                    data: [0],
                },
            ],
        })
const options = {
    responsive: true,
    maintainAspectRatio: false,
  }

// functions that mutate state and trigger updates
function getBlocks() {
    setInterval(async function () {
    const blocks = (await get('http://localhost:3000/burn')).data

    let blockLabels = []
    let blockData = []

    for (const block in blocks) {
        blockLabels.push(blocks[block].block_number.toString())
        blockData.push(utils.formatEther(blocks[block].burned_amount))
    }
    
    data.value = {
        labels: blockLabels,
        datasets: [
            {
                label: 'Data One',
                backgroundColor: '#f87979',
                data: blockData,
                borderColor: 'rgb(75, 192, 192)',
            },
        ],
    }
    }, 5000);
}

// lifecycle hooks
onMounted(() => {
    getBlocks()
})
</script>

<template>
    <div>
        <Line :data="data" :options="options" />
    </div>    
</template>
document.addEventListener('DOMContentLoaded', () => {
    const customerTable = document.getElementById('customer-table')
    const filterNameInput = document.getElementById('filter-name')
    const filterAmountInput = document.getElementById('filter-amount')
    const apiUrl = 'http://localhost:3002'
    const body = document.body
    const toggle = document.getElementById('toggle')
    const mainText = document.getElementById('mainText')
    const transactionGraphCanvas = document.getElementById('transactionChart')
    let transactionChart = null
    let transactions = [];


    //dark mode
    toggle.addEventListener('click', function () {
        console.log('done')
        body.classList.toggle('bg-black')
        customerTable.classList.toggle('table-dark')
        customerTable.classList.toggle('text-white')
        mainText.classList.toggle('text-white')
        toggle.classList.toggle('cust')
        if (toggle.classList.contains('cust')) {
            toggle.innerText = 'light mode'
        }
        else { toggle.innerText = 'dark mode' }

    })


    // Fetch Data
    const fetchData = async () => {
        const customerResponse = await fetch(`${apiUrl}/customers`);
        customers = await customerResponse.json();

        const transactionResponse = await fetch(`${apiUrl}/transactions`);
        transactions = await transactionResponse.json();

        displayData(transactions, customers);
    };

    // Display Data
    function displayData(transactions, customers) {
        let dev = '';
        for (let i = 0; i < transactions.length; i++) {

            const customer = customers.find(cust => cust.id == transactions[i].customer_id)
            const customerName = customer ? customer.name : 'Unknown'

            dev += `<tr>
                     <td>${customerName}</td>  
                     <td>${transactions[i].date}</td>
                     <td>${transactions[i].amount}</td>
                     <td><a href='#transactionGraph' class='btn btn-danger graph' cust-id='${transactions[i].customer_id}'trans-id='${transactions[i].id}'>graph</a></td>
                     </tr>`;
        }
        document.getElementById('demo').innerHTML = dev;
        const graphButtons = document.querySelectorAll('.graph');
        graphButtons.forEach(button => {
            button.addEventListener('click', handleGraphButtonClick);

        });

    }


    // add event to calc total transaction of customer and display the graph
    function handleGraphButtonClick(event) {
        const customerId = parseInt(event.target.getAttribute('cust-id'));
        const customerTransactions = transactions.filter(transaction => transaction.customer_id == customerId);
        const totalAmount = customerTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const customer = customers.find(cust => cust.id == customerId);
        const customerName = customer ? customer.name : 'Unknown';


        document.getElementById('custName').innerText = customerName;
        console.log(`Transactions for customer ID ${customerId}:`, customerTransactions);
        console.log(`Total transaction amount: ${totalAmount}`);

        displayGraph(customerId, customerTransactions);
    }

    //display graph
    function displayGraph(customerId, customerTransactions) {
        const transactionData = customerTransactions.reduce((acc, transaction) => {
            if (!acc[transaction.date]) {
                acc[transaction.date] = 0;
            }
            acc[transaction.date] += transaction.amount;
            return acc;
        }, {});

        const dates = Object.keys(transactionData);
        const amounts = Object.values(transactionData);


        if (transactionChart) {
            transactionChart.destroy();
        }


        const isDarkMode = body.classList.contains('bg-black');
        const backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(75, 192, 192, 0.2)';
        const borderColor = isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(75, 192, 192, 1)';


        transactionChart = new Chart(transactionGraphCanvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Transaction Amount',
                    data: amounts,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: isDarkMode ? 'white' : 'black' // Adjust legend text color
                        }
                    }
                }
            }
        });
    }


    //filter by name
    function filterByName() {
        const filterName = filterNameInput.value.toLowerCase();
        const filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(cust => cust.id == transaction.customer_id)
            const customerName = customer ? customer.name.toLowerCase() : ''
            return customerName.includes(filterName)
        });
        displayData(filteredTransactions, customers)
    }
    //filter by amount 
    function filterByAmount() {
        const filterAmount = parseFloat(filterAmountInput.value)
        if (filterAmountInput.value == ``) { displayData(transactions, customers) }
        else {
            const filteredTransactions = transactions.filter(transaction => { return filterAmount === transaction.amount })
            displayData(filteredTransactions, customers)
        }
    }
    // add events to search boxes
    filterNameInput.addEventListener('input', filterByName)
    filterAmountInput.addEventListener('input', filterByAmount);

    function createCharts() {
        console.log('grapBtn')
    }



    fetchData();
});

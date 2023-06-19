var firstSeatLabel = 1;
var booked = !!localStorage.getItem('booked') ? $.parseJSON(localStorage.getItem('booked')) : [];
$(document).ready(function () {
    var $cart = $('#selected-seats'),
        $counter = $('#counter'),
        $total = $('#total'),
        sc = $('#croquis').seatCharts({
            map: [
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'ee_ee',
                'eeeee',
            ],
            seats: {
                e: {
                    price: 50,
                    classes: 'economy-class', //your custom CSS class
                    category: 'Asiento'
                }

            },
            naming: {
                top: false,
                getLabel: function (character, row, column) {
                    return firstSeatLabel++;
                },
            },
            legend: {
                node: $('#legend'),
                items: [
                    ['e', 'available', 'Libre'],
                    ['f', 'unavailable', 'Reservado']
                ]
            },
            click: function () {
                if (this.status() == 'available') {
                    //let's create a new <li> which we'll add to the cart items
                    $('<li>' + this.data().category + ' ' + this.settings.label + ': <b>$' + this.data().price + '</b> </li>')
                        .attr('id', 'cart-item-' + this.settings.id)
                        .data('seatId', this.settings.id)
                        .appendTo($cart);

                    /*
                     * Lets update the counter and total
                     *
                     * .find function will not find the current seat, because it will change its stauts only after return
                     * 'selected'. This is why we have to add 1 to the length and the current seat price to the total.
                     */
                    $counter.text(sc.find('selected').length + 1);
                    $total.text(recalculateTotal(sc) + this.data().price);

                    return 'selected';

                } else if (this.status() == 'selected') {

                    //update the counter
                    $counter.text(sc.find('selected').length - 1);

                    //and total
                    $total.text(recalculateTotal(sc) - this.data().price);

                    //remove the item from our cart
                    $('#cart-item-' + this.settings.id).remove();

                    //seat has been vacated
                    return 'available';

                } else if (this.status() == 'unavailable') {
                    //seat has been already booked
                    return 'unavailable';
                } else {
                    return this.style();
                }
            }
        });

    //let's pretend some seats have already been booked
    // sc.get(['1_2', '4_1', '7_1', '7_2']).status('unavailable');
    sc.get(booked).status('unavailable');

});

function recalculateTotal(sc) {
    var total = 0;

    //basically find every selected seat and sum its price
    sc.find('selected').each(function () {

        total += this.data().price;

    });

    return total;
}

$(function () {
    $('#checkout-button').click(function () {
        var items = $('#selected-seats li')
        if (items.length <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Escoger algun asiento'
            })
            return false;
        }
        var selected = [];
        items.each(function (e) {
            var id = $(this).attr('id')
            id = id.replace("cart-item-", "")
            selected.push(id)
        })
        if (Object.keys(booked).length > 0) {
            Object.keys(booked).map(k => {
                selected.push(booked[k])
            })
        }
        localStorage.setItem('booked', JSON.stringify(selected))
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Compra Exitosa!',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            location.reload();
          });
    })
    $('#reinicio').click(function () {
        /*if (confirm("¿Reiniciar la compra de boletos?") === true) {
            localStorage.removeItem('booked')
            Swal.fire(
                '¡Excelente!',
                'Reinicio completo',
                'success'
            )
            location.reload()
        }*/
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-success',
              cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
          })
          
          swalWithBootstrapButtons.fire({
            title: 'Estas seguro de reiniciar la compra de boletos?',
            text: "No se podra revertir el proceso",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, Seguro',
            cancelButtonText: 'No, Cancelar',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('booked')
              swalWithBootstrapButtons.fire(
                'Reiniciado',
                'El proceso de compra fue reiniciado',
                'success'
                
              ).then(() => {
                location.reload();
              });
            } else if (
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelado',
                'Compra en curso',
                'error'
              )
            }
          })
    })
    
})
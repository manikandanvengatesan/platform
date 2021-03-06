import {Controller} from 'stimulus';

export default class extends Controller {
    /**
     *
     */
    connect() {
        const select = this.element.querySelector('select');

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf_token"]').attr('content'),
            },
        });

        $(select).select2({
            theme: 'bootstrap',
            allowClear: !select.hasAttribute('required'),
            ajax: {
                type: 'POST',
                cache: true,
                delay: 250,
                url: () => this.data.get('route'),
                dataType: 'json',
                processResults: (data) => {

                    let dataFormat = [];

                    data.forEach(function(value,key) {
                        dataFormat.push({
                            'key' : key,
                            'text': value
                        });
                    });

                    console.log(dataFormat);

                    // Tranforms the top-level key of the response object from 'items' to 'results'
                    return {
                        results: dataFormat
                    };
                },
                data: (params) => {
                    return {
                        search: params.term,
                        model: this.data.get('model'),
                        name: this.data.get('name'),
                        key: this.data.get('key'),
                    };
                }
            },
            placeholder: select.getAttribute('placeholder') || '',
        }).on('select2:unselecting', function () {
            $(this).data('state', 'unselected');
        }).on('select2:opening', function (e) {
            if ($(this).data('state') === 'unselected') {
                e.preventDefault();
                $(this).removeData('state');
            }
        });

        //if (!this.data.get('value')) {
            //return;
        //}

        axios.post(this.data.get('route')).then((response) => {
            $(select)
                .append(new Option(response.data.text, response.data.id, true, true))
                .trigger('change');
        });

        document.addEventListener('turbolinks:before-cache', () => {
            $(select).select2('destroy');
        }, {once: true});
    }
}

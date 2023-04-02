/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.svalyn.studio.domain.business.services;

import com.svalyn.studio.domain.observe.ComposedObservation;
import com.svalyn.studio.domain.observe.IObservation;
import com.svalyn.studio.domain.observe.IObserver;
import com.svalyn.studio.domain.observe.Observation;

import java.util.ArrayList;
import java.util.List;

/**
 * Used to observe the creation of the new domain.
 *
 * @author sbegaudeau
 */
public class DomainCreationObserver implements IObserver {

    private IObservation observation;

    @Override
    public void onObservation(IObservation newObservation) {
        if (this.observation == null) {
            this.observation = newObservation;
        } else if (this.observation instanceof Observation simpleObservation) {
            List<IObservation> observations = new ArrayList<>();
            observations.add(this.observation);
            observations.add(simpleObservation);
            this.observation = new ComposedObservation("An issue has been detected with the new domain", observations);
        } else if (this.observation instanceof ComposedObservation composedObservation) {
            composedObservation.observations().add(newObservation);
        }
    }

    public boolean hasObservation() {
        return this.observation != null;
    }

    public IObservation getObservation() {
        return this.observation;
    }
}
